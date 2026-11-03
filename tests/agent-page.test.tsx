// @vitest-environment jsdom
import { it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import AgentPage from '@/app/agent/page';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('renders the live voice screen with its controls', () => {
  render(<AgentPage />);
  expect(screen.getByRole('heading', { name: 'BridgeAgent Live' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Start listening' })).toBeTruthy();
  expect(screen.getByLabelText('Preferred title')).toBeTruthy();
  expect(screen.getByLabelText('Agent status')).toBeTruthy();
  expect(screen.getByText(/not saved to browser storage/)).toBeTruthy();
  expect(screen.getByText(/No real telephone connection/)).toBeTruthy();
  expect(screen.getByText(/needs its access code for AI replies/)).toBeTruthy();
});

it('offers all four conversation languages with device-support warnings', () => {
  render(<AgentPage />);
  const select = screen.getByLabelText('Conversation language') as HTMLSelectElement;
  const labels = Array.from(select.options).map((o) => o.text);
  expect(labels).toContain('English');
  expect(labels).toContain('Spanish');
  expect(labels).toContain('Pashto (device support required)');
  expect(labels).toContain('Dari (device support required)');
});

it('starts a session on Start listening without a microphone', () => {
  render(<AgentPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Start listening' }));
  expect(screen.getByRole('button', { name: 'End session' })).toBeTruthy();
  expect(screen.getByLabelText('Message to agent')).toBeTruthy();
  expect(screen.getByLabelText('Message to agent')).not.toHaveProperty('disabled', true);
});
