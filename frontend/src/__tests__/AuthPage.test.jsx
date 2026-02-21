import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AuthPage from '../components/AuthPage';

vi.mock('../services/api', () => ({
  loginPatient:    vi.fn(),
  registerPatient: vi.fn(),
}));

import { loginPatient, registerPatient } from '../services/api';

const mockPatient = { id: 1, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' };

describe('AuthPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the login form by default', () => {
    render(<AuthPage onAuth={() => {}} />);
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    expect(screen.getByTestId('auth-submit')).toBeTruthy();
  });

  it('switches to the register form when the Register tab is clicked', () => {
    render(<AuthPage onAuth={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(screen.getByLabelText(/first name/i)).toBeTruthy();
    expect(screen.getByLabelText(/last name/i)).toBeTruthy();
    expect(screen.getByLabelText(/date of birth/i)).toBeTruthy();
  });

  it('calls loginPatient and onAuth on successful login', async () => {
    loginPatient.mockResolvedValueOnce({ data: { token: 'tok123', patient: mockPatient } });
    const onAuth = vi.fn();

    render(<AuthPage onAuth={onAuth} />);
    fireEvent.change(screen.getByLabelText(/email/i),    { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('auth-submit'));

    await waitFor(() => expect(onAuth).toHaveBeenCalledWith(mockPatient));
    expect(localStorage.getItem('token')).toBe('tok123');
  });

  it('calls registerPatient and onAuth on successful registration', async () => {
    registerPatient.mockResolvedValueOnce({ data: { token: 'tok456', patient: mockPatient } });
    const onAuth = vi.fn();

    render(<AuthPage onAuth={onAuth} />);
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    fireEvent.change(screen.getByLabelText(/first name/i),   { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/last name/i),    { target: { value: 'Smith' } });
    fireEvent.change(screen.getByLabelText(/date of birth/i),{ target: { value: '1985-01-01' } });
    fireEvent.change(screen.getByLabelText(/email/i),        { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i),     { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('auth-submit'));

    await waitFor(() => expect(onAuth).toHaveBeenCalledWith(mockPatient));
    expect(localStorage.getItem('token')).toBe('tok456');
  });

  it('displays an error message on failed login', async () => {
    loginPatient.mockRejectedValueOnce({ response: { data: { error: 'Invalid email or password' } } });

    render(<AuthPage onAuth={() => {}} />);
    fireEvent.change(screen.getByLabelText(/email/i),    { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByTestId('auth-submit'));

    await waitFor(() => expect(screen.getByText('Invalid email or password')).toBeTruthy());
  });

  it('clears the error when switching tabs', async () => {
    loginPatient.mockRejectedValueOnce({ response: { data: { error: 'Invalid email or password' } } });

    render(<AuthPage onAuth={() => {}} />);
    fireEvent.change(screen.getByLabelText(/email/i),    { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByTestId('auth-submit'));
    await waitFor(() => screen.getByText('Invalid email or password'));

    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(screen.queryByText('Invalid email or password')).toBeNull();
  });
});
