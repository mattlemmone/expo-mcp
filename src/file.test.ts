import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import { Dirent } from 'fs';
import { readFile, writeFile, listFiles, tailFile } from './file.js';

describe('File Operations', () => {
  // Common test variables
  const mockLog = {
    info: jest.fn(),
    error: jest.fn(),
  };
  const context = { log: mockLog };
  
  let readFileSpy: jest.SpiedFunction<typeof fs.promises.readFile>;
  let writeFileSpy: jest.SpiedFunction<typeof fs.promises.writeFile>;
  let mkdirSpy: jest.SpiedFunction<typeof fs.promises.mkdir>;
  let readdirSpy: jest.SpiedFunction<typeof fs.promises.readdir>;

  beforeEach(() => {
    readFileSpy = jest.spyOn(fs.promises, 'readFile');
    writeFileSpy = jest.spyOn(fs.promises, 'writeFile');
    mkdirSpy = jest.spyOn(fs.promises, 'mkdir');
    readdirSpy = jest.spyOn(fs.promises, 'readdir');
    jest.clearAllMocks();
  });

  afterEach(() => {
    readFileSpy.mockRestore();
    writeFileSpy.mockRestore();
    mkdirSpy.mockRestore();
    readdirSpy.mockRestore();
  });

  describe('readFile', () => {
    it('should read a file successfully', async () => {
      // Arrange
      const filePath = '/path/to/file.txt';
      const fileContent = 'file content';
      readFileSpy.mockResolvedValue(fileContent as any);
      
      // Act
      const result = await readFile({ filePath }, context);
      
      // Assert
      expect(readFileSpy).toHaveBeenCalledWith(expect.any(String), 'utf8');
      expect(mockLog.info).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: fileContent,
          },
        ],
      });
    });

    it('should handle errors when reading a file', async () => {
      // Arrange
      const filePath = '/path/to/nonexistent.txt';
      const errorMessage = 'File not found';
      readFileSpy.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(readFile({ filePath }, context)).rejects.toThrow(`Failed to read file: ${errorMessage}`);
      expect(mockLog.error).toHaveBeenCalledWith(`Error reading file: ${errorMessage}`);
    });
  });

  describe('writeFile', () => {
    it('should write to a file successfully', async () => {
      // Arrange
      const filePath = '/path/to/output.txt';
      const content = 'new content';
      mkdirSpy.mockResolvedValue(undefined as any);
      writeFileSpy.mockResolvedValue(undefined as any);
      
      // Act
      const result = await writeFile({ filePath, content }, context);
      
      // Assert
      expect(mkdirSpy).toHaveBeenCalledWith(expect.any(String), { recursive: true });
      expect(writeFileSpy).toHaveBeenCalledWith(expect.any(String), content);
      expect(mockLog.info).toHaveBeenCalledTimes(2);
      expect(result.content[0].text).toContain(`Successfully wrote ${content.length} characters`);
    });

    it('should handle errors when writing to a file', async () => {
      // Arrange
      const filePath = '/path/to/protected.txt';
      const content = 'new content';
      const errorMessage = 'Permission denied';
      mkdirSpy.mockResolvedValue(undefined as any);
      writeFileSpy.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(writeFile({ filePath, content }, context)).rejects.toThrow(`Failed to write file: ${errorMessage}`);
      expect(mockLog.error).toHaveBeenCalledWith(`Error writing file: ${errorMessage}`);
    });
  });

  describe('listFiles', () => {
    it('should list files in a directory successfully', async () => {
      // Arrange
      const directoryPath = '/path/to/dir';
      // Create mock Dirent objects
      const mockDirents = [
        { 
          name: 'file1.txt', 
          isDirectory: () => false,
          isFile: () => true,
          isBlockDevice: () => false,
          isCharacterDevice: () => false,
          isFIFO: () => false,
          isSocket: () => false,
          isSymbolicLink: () => false
        },
        { 
          name: 'subdir', 
          isDirectory: () => true,
          isFile: () => false,
          isBlockDevice: () => false,
          isCharacterDevice: () => false,
          isFIFO: () => false,
          isSocket: () => false,
          isSymbolicLink: () => false
        },
      ] as Dirent[];
      
      readdirSpy.mockResolvedValue(mockDirents as any);
      
      // Act
      const result = await listFiles({ directoryPath }, context);
      
      // Assert
      expect(readdirSpy).toHaveBeenCalledWith(expect.any(String), { withFileTypes: true });
      expect(mockLog.info).toHaveBeenCalledTimes(2);
      
      const fileList = JSON.parse(result.content[0].text);
      expect(fileList).toHaveLength(2);
      expect(fileList[0].name).toBe('file1.txt');
      expect(fileList[0].isDirectory).toBe(false);
      expect(fileList[1].name).toBe('subdir');
      expect(fileList[1].isDirectory).toBe(true);
    });

    it('should handle errors when listing files', async () => {
      // Arrange
      const directoryPath = '/path/to/nonexistent';
      const errorMessage = 'Directory not found';
      readdirSpy.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(listFiles({ directoryPath }, context)).rejects.toThrow(`Failed to list files: ${errorMessage}`);
      expect(mockLog.error).toHaveBeenCalledWith(`Error listing files: ${errorMessage}`);
    });
  });

  describe('tailFile', () => {
    it('should return the last N lines of a file', async () => {
      // Arrange
      const filePath = '/path/to/log.txt';
      const lines = 3;
      const fileContent = 'line1\nline2\nline3\nline4\nline5';
      readFileSpy.mockResolvedValue(fileContent as any);
      
      // Act
      const result = await tailFile({ filePath, lines }, context);
      
      // Assert
      expect(readFileSpy).toHaveBeenCalledWith(expect.any(String), 'utf8');
      expect(mockLog.info).toHaveBeenCalledTimes(2);
      expect(result.content[0].text).toBe('line3\nline4\nline5');
    });

    it('should handle fewer lines than requested', async () => {
      // Arrange
      const filePath = '/path/to/short.txt';
      const lines = 10;
      const fileContent = 'line1\nline2';
      readFileSpy.mockResolvedValue(fileContent as any);
      
      // Act
      const result = await tailFile({ filePath, lines }, context);
      
      // Assert
      expect(result.content[0].text).toBe('line1\nline2');
    });

    it('should handle errors when tailing a file', async () => {
      // Arrange
      const filePath = '/path/to/nonexistent.txt';
      const lines = 5;
      const errorMessage = 'File not found';
      readFileSpy.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(tailFile({ filePath, lines }, context)).rejects.toThrow(`Failed to tail file: ${errorMessage}`);
      expect(mockLog.error).toHaveBeenCalledWith(`Error tailing file: ${errorMessage}`);
    });
  });
});
