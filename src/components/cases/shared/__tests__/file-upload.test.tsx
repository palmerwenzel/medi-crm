import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FileUploadZone } from '../file-upload'
import { validateFile } from '@/lib/utils/file-validation'

// Mock the file validation utility
jest.mock('@/lib/utils/file-validation', () => ({
  validateFile: jest.fn(),
}))

describe('FileUploadZone', () => {
  const mockOnFilesSelected = jest.fn()
  const mockOnFileRemoved = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(validateFile as jest.Mock).mockResolvedValue({
      isValid: true,
      metadata: {
        hash: 'test-hash',
        size: 1024,
        mimeType: 'image/jpeg',
      },
    })
  })

  it('renders upload zone with instructions', () => {
    render(
      <FileUploadZone
        onFilesSelected={mockOnFilesSelected}
        onFileRemoved={mockOnFileRemoved}
      />
    )

    expect(screen.getByText(/Drag & drop files here/i)).toBeInTheDocument()
    expect(screen.getByText(/up to 5MB/i)).toBeInTheDocument()
  })

  it('shows drag active state', () => {
    render(
      <FileUploadZone
        onFilesSelected={mockOnFilesSelected}
        onFileRemoved={mockOnFileRemoved}
      />
    )

    const dropzone = screen.getByText(/Drag & drop files here/i).parentElement!
    fireEvent.dragEnter(dropzone)

    expect(screen.getByText('Drop the files here')).toBeInTheDocument()
  })

  it('handles file selection', async () => {
    render(
      <FileUploadZone
        onFilesSelected={mockOnFilesSelected}
        onFileRemoved={mockOnFileRemoved}
      />
    )

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const dropzone = screen.getByText(/Drag & drop files here/i).parentElement!

    // Simulate file drop
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    })

    await waitFor(() => {
      expect(validateFile).toHaveBeenCalledWith(file, expect.any(Array))
      expect(mockOnFilesSelected).toHaveBeenCalledWith([file])
    })
  })

  it('shows error for invalid files', async () => {
    (validateFile as jest.Mock).mockResolvedValue({
      isValid: false,
      error: {
        code: 'INVALID_TYPE',
        message: 'Invalid file type',
      },
    })

    render(
      <FileUploadZone
        onFilesSelected={mockOnFilesSelected}
        onFileRemoved={mockOnFileRemoved}
      />
    )

    const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' })
    const dropzone = screen.getByText(/Drag & drop files here/i).parentElement!

    // Simulate file drop
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    })

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument()
      expect(mockOnFilesSelected).not.toHaveBeenCalled()
    })
  })

  it('enforces file limit', async () => {
    render(
      <FileUploadZone
        onFilesSelected={mockOnFilesSelected}
        onFileRemoved={mockOnFileRemoved}
        maxFiles={1}
      />
    )

    const files = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
    ]

    const dropzone = screen.getByText(/Drag & drop files here/i).parentElement!

    // Simulate file drop
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files,
      },
    })

    await waitFor(() => {
      expect(screen.getByText(/You can only upload up to 1 files/i)).toBeInTheDocument()
      expect(mockOnFilesSelected).not.toHaveBeenCalled()
    })
  })

  it('allows file removal', async () => {
    (validateFile as jest.Mock).mockResolvedValue({
      isValid: true,
      metadata: {
        hash: 'test-hash',
        size: 1024,
        mimeType: 'image/jpeg',
      },
    })

    render(
      <FileUploadZone
        onFilesSelected={mockOnFilesSelected}
        onFileRemoved={mockOnFileRemoved}
      />
    )

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const dropzone = screen.getByText(/Drag & drop files here/i).parentElement!

    // Add file
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    })

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })

    // Remove file
    const removeButton = screen.getByRole('button', { name: /Remove file/i })
    fireEvent.click(removeButton)

    expect(mockOnFileRemoved).toHaveBeenCalledWith('test.jpg')
    expect(screen.queryByText('test.jpg')).not.toBeInTheDocument()
  })

  it('shows upload progress', () => {
    render(
      <FileUploadZone
        onFilesSelected={mockOnFilesSelected}
        onFileRemoved={mockOnFileRemoved}
        uploadProgress={{
          'test.jpg': 50,
        }}
      />
    )

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const dropzone = screen.getByText(/Drag & drop files here/i).parentElement!

    // Add file
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    })

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '50')
  })

  it('disables upload zone when disabled prop is true', () => {
    render(
      <FileUploadZone
        onFilesSelected={mockOnFilesSelected}
        onFileRemoved={mockOnFileRemoved}
        disabled={true}
      />
    )

    const dropzone = screen.getByText(/Drag & drop files here/i).parentElement!
    expect(dropzone).toHaveClass('cursor-not-allowed')
  })
}) 