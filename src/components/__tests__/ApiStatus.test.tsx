import React from 'react';
import { render, screen } from '@testing-library/react';
import { ApiStatus } from '../ApiStatus';
import { useApiStatus } from '../../hooks/useApiStatus';
import { STATUS_MESSAGES } from '../../config/constants';

jest.mock('../../hooks/useApiStatus');

describe('ApiStatus', () => {
  const mockApiKey = 'test-api-key';
  const mockOnInvalidKey = jest.fn();

  beforeEach(() => {
    (useApiStatus as jest.Mock).mockReturnValue({
      status: 'checking',
      isVisible: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing when not visible', () => {
    (useApiStatus as jest.Mock).mockReturnValue({
      status: 'valid',
      isVisible: false
    });

    const { container } = render(
      <ApiStatus apiKey={mockApiKey} onInvalidKey={mockOnInvalidKey} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ['checking', 'AlertTriangle'],
    ['valid', 'CheckCircle'],
    ['invalid', 'XCircle']
  ])('should render correct icon for %s status', (status, expectedIcon) => {
    (useApiStatus as jest.Mock).mockReturnValue({
      status,
      isVisible: true
    });

    render(<ApiStatus apiKey={mockApiKey} onInvalidKey={mockOnInvalidKey} />);

    const icon = screen.getByTestId(`${expectedIcon}-icon`);
    expect(icon).toBeInTheDocument();
  });

  it.each([
    ['checking'],
    ['valid'],
    ['invalid']
  ])('should render correct message for %s status', (status) => {
    (useApiStatus as jest.Mock).mockReturnValue({
      status,
      isVisible: true
    });

    render(<ApiStatus apiKey={mockApiKey} onInvalidKey={mockOnInvalidKey} />);

    const message = screen.getByText(STATUS_MESSAGES[status]);
    expect(message).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(<ApiStatus apiKey={mockApiKey} onInvalidKey={mockOnInvalidKey} />);

    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveAttribute('aria-live', 'polite');
  });
});
