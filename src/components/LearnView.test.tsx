import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import LearnView from './LearnView';

describe('LearnView', () => {
  it('renders the child-friendly Russian learning story and sources', () => {
    render(<LearnView language="ru" onClose={() => undefined} />);

    expect(screen.getByRole('heading', {level: 1, name: 'Удивительное путешествие света'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Почему после экрана глазам некомфортно?'})).toBeInTheDocument();
    expect(screen.getByAltText(/луч света проходит через хрусталик/i)).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'National Eye Institute'})).toHaveAttribute('href', expect.stringContaining('nei.nih.gov'));
  });

  it('uses the selected language and returns home', () => {
    const onClose = vi.fn();
    render(<LearnView language="en" onClose={onClose} />);

    expect(screen.getByRole('heading', {level: 1, name: 'The amazing journey of light'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /back home/i}));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
