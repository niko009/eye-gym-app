"""Generate the versioned offline Eye Gym voice packs.

Requires edge-tts 7.2.7 and ffprobe. Run from the repository root:
    python scripts/generate_audio.py
"""

from __future__ import annotations

import asyncio
import json
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path

import edge_tts
from edge_tts import exceptions


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "data.ts"
OUTPUT = ROOT / "public" / "audio" / "v1"
MANIFEST = ROOT / "public" / "audio" / "manifest.json"

RATE = "+12%"
PITCH = "-2Hz"
VOLUME = "+0%"
VOICES = {
    "ru": "ru-RU-SvetlanaNeural",
    "ro": "ro-RO-AlinaNeural",
    "en": "en-US-JennyNeural",
}
CUES = {
    "rest": {
        "ru": "Отдых. Расслабьте глаза и приготовьтесь к следующему упражнению.",
        "ro": "Pauză. Relaxați ochii și pregătiți-vă pentru următorul exercițiu.",
        "en": "Rest. Relax your eyes and get ready for the next exercise.",
    },
    "finished": {
        "ru": "Тренировка завершена. Отличная работа!",
        "ro": "Antrenamentul s-a încheiat. Excelent!",
        "en": "Workout complete. Great work!",
    },
}

EXERCISE_PATTERN = re.compile(
    r"\{id: '([^']+)', name: text\('([^']*)', '([^']*)', '([^']*)'\), "
    r"instruction: text\('([^']*)', '([^']*)', '([^']*)'\).*?"
    r"(.*?)animationType:"
)


@dataclass(frozen=True)
class ExerciseCopy:
    exercise_id: str
    names: dict[str, str]
    instructions: dict[str, str]
    duration_seconds: int


def read_exercises() -> list[ExerciseCopy]:
    source = SOURCE.read_text(encoding="utf-8")
    exercises: list[ExerciseCopy] = []
    for match in EXERCISE_PATTERN.finditer(source):
        exercise_id, ru_name, ro_name, en_name, ru_instruction, ro_instruction, en_instruction, tail = match.groups()
        duration_match = re.search(r"durationSeconds: (\d+)", tail)
        exercises.append(
            ExerciseCopy(
                exercise_id=exercise_id,
                names={"ru": ru_name, "ro": ro_name, "en": en_name},
                instructions={"ru": ru_instruction, "ro": ro_instruction, "en": en_instruction},
                duration_seconds=int(duration_match.group(1)) if duration_match else 30,
            )
        )
    if len(exercises) != 16:
        raise RuntimeError(f"Expected 16 exercises in {SOURCE}, found {len(exercises)}")
    return exercises


def narration(exercise: ExerciseCopy, language: str) -> str:
    if exercise.exercise_id == "up-down":
        return {
            "ru": "Упражнение «Вверх и вниз». Держите голову неподвижно. Медленно поднимите взгляд вверх, а затем плавно опустите вниз. Продолжайте в удобном темпе. Не напрягайтесь и дышите ровно.",
            "ro": "Exercițiul sus și jos. Țineți capul nemișcat. Ridicați încet privirea, apoi coborâți-o lin. Continuați într-un ritm confortabil. Nu vă încordați și respirați normal.",
            "en": "Up and down. Keep your head still. Slowly raise your eyes, then gently lower them. Continue at a comfortable pace. Stay relaxed and breathe naturally.",
        }[language]

    instruction = exercise.instructions[language]
    if language == "ru":
        prefix = f"Упражнение «{exercise.names[language]}»."
        if exercise.exercise_id in {"blink", "butterfly"}:
            return f"{prefix} {instruction} Не напрягайте глаза."
        if exercise.exercise_id in {"palming", "nose-writing"}:
            return f"{prefix} {instruction} Расслабьтесь и дышите ровно."
        return f"{prefix} {instruction} Выполняйте движение плавно, в удобном темпе. Не напрягайтесь и дышите ровно."
    if language == "ro":
        prefix = f"Exercițiul „{exercise.names[language]}”."
        if exercise.exercise_id in {"blink", "butterfly"}:
            return f"{prefix} {instruction} Nu vă încordați ochii."
        if exercise.exercise_id in {"palming", "nose-writing"}:
            return f"{prefix} {instruction} Relaxați-vă și respirați normal."
        return f"{prefix} {instruction} Faceți mișcarea lin, într-un ritm confortabil. Nu vă încordați și respirați normal."

    prefix = f"{exercise.names[language]}."
    if exercise.exercise_id in {"blink", "butterfly"}:
        return f"{prefix} {instruction} Keep your eyes relaxed."
    if exercise.exercise_id in {"palming", "nose-writing"}:
        return f"{prefix} {instruction} Relax and breathe naturally."
    return f"{prefix} {instruction} Move smoothly at a comfortable pace. Stay relaxed and breathe naturally."


def audio_duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return round(float(result.stdout.strip()), 3)


async def generate_one(exercise: ExerciseCopy, language: str, semaphore: asyncio.Semaphore) -> dict[str, object]:
    destination = OUTPUT / language / f"{exercise.exercise_id}.mp3"
    destination.parent.mkdir(parents=True, exist_ok=True)
    text = narration(exercise, language)
    async with semaphore:
        for attempt in range(1, 4):
            try:
                communicate = edge_tts.Communicate(
                    text=text,
                    voice=VOICES[language],
                    rate=RATE,
                    pitch=PITCH,
                    volume=VOLUME,
                    connect_timeout=15,
                    receive_timeout=60,
                )
                await communicate.save(str(destination))
                break
            except (exceptions.EdgeTTSException, OSError) as error:
                destination.unlink(missing_ok=True)
                if attempt == 3:
                    raise RuntimeError(f"Failed to generate {language}/{exercise.exercise_id}") from error
                await asyncio.sleep(2**attempt)

    duration = audio_duration(destination)
    if duration >= exercise.duration_seconds:
        raise RuntimeError(
            f"{language}/{exercise.exercise_id} narration is {duration}s, but the exercise lasts {exercise.duration_seconds}s"
        )
    print(f"generated {language}/{exercise.exercise_id}.mp3 ({duration:.1f}s)", flush=True)
    return {
        "id": exercise.exercise_id,
        "file": f"/audio/v1/{language}/{exercise.exercise_id}.mp3",
        "durationSeconds": duration,
        "exerciseDurationSeconds": exercise.duration_seconds,
        "text": text,
    }


async def generate_cue(cue_id: str, language: str, semaphore: asyncio.Semaphore) -> dict[str, object]:
    destination = OUTPUT / language / f"{cue_id}.mp3"
    text = CUES[cue_id][language]
    async with semaphore:
        for attempt in range(1, 4):
            try:
                await edge_tts.Communicate(
                    text=text,
                    voice=VOICES[language],
                    rate=RATE,
                    pitch=PITCH,
                    volume=VOLUME,
                    connect_timeout=15,
                    receive_timeout=60,
                ).save(str(destination))
                break
            except (exceptions.EdgeTTSException, OSError) as error:
                destination.unlink(missing_ok=True)
                if attempt == 3:
                    raise RuntimeError(f"Failed to generate {language}/{cue_id}") from error
                await asyncio.sleep(2**attempt)
    duration = audio_duration(destination)
    maximum = 10 if cue_id == "rest" else 15
    if duration >= maximum:
        raise RuntimeError(f"{language}/{cue_id} is too long: {duration}s")
    print(f"generated {language}/{cue_id}.mp3 ({duration:.1f}s)", flush=True)
    return {"id": cue_id, "file": f"/audio/v1/{language}/{cue_id}.mp3", "durationSeconds": duration, "text": text}


async def main() -> None:
    exercises = read_exercises()
    semaphore = asyncio.Semaphore(3)
    tasks = [generate_one(exercise, language, semaphore) for language in VOICES for exercise in exercises]
    generated = await asyncio.gather(*tasks)
    cues = await asyncio.gather(*(generate_cue(cue_id, language, semaphore) for language in VOICES for cue_id in CUES))
    packs = {
        language: {
            "voice": voice,
            "rate": RATE,
            "pitch": PITCH,
            "volume": VOLUME,
            "exercises": [entry for entry in generated if str(entry["file"]).startswith(f"/audio/v1/{language}/")],
            "cues": [entry for entry in cues if str(entry["file"]).startswith(f"/audio/v1/{language}/")],
        }
        for language, voice in VOICES.items()
    }
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(
        json.dumps({"version": 1, "provider": "edge-tts", "generatorVersion": "7.2.7", "packs": packs}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {MANIFEST} with {len(generated) + len(cues)} files", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
