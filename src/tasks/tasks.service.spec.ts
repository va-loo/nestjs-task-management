import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { User } from '../auth/user.entity';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';
import { Task } from './task.entity';

const mockTasksRepository = () => ({
  getTasks: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
  createTask: jest.fn(),
  save: jest.fn(),
});

const mockUser: User = {
  username: 'John',
  id: 'someId',
  password: 'somePass',
  tasks: [],
};

const mockTask: Omit<Task, 'user'> = {
  id: 'testId',
  title: 'test title',
  description: 'test description',
  status: TaskStatus.OPEN,
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useFactory: mockTasksRepository },
      ],
    }).compile();

    tasksService = module.get(TasksService);
    tasksRepository = module.get(TasksRepository);
  });

  describe('getTasks', () => {
    it('calls TasksRepository.getTasks and returns the result', async () => {
      const mockTasks = [mockTask];
      tasksRepository.getTasks.mockResolvedValue(mockTasks);
      const result = await tasksService.getTasks(null, mockUser);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getTaskById', () => {
    it('calls TasksRepository.findOneBy and returns the result', async () => {
      tasksRepository.findOneBy.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById('testId', mockUser);
      expect(result).toEqual(mockTask);
    });

    it('calls TasksRepository.findOneBy and handles an error', async () => {
      tasksRepository.findOneBy.mockResolvedValue(null);
      await expect(
        tasksService.getTaskById('testId', mockUser),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('deleteTaskById', () => {
    it('calls TasksRepository.delete', async () => {
      tasksRepository.delete.mockResolvedValue('testId');
      await tasksService.deleteTaskById('testId', mockUser);
      expect(tasksRepository.delete).toHaveBeenCalled();
    });

    it('calls TasksRepository.delete and handles an error', async () => {
      tasksRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(
        tasksService.deleteTaskById('testId', mockUser),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('createTask', () => {
    it('calls TasksRepository.createTask and returns the result', async () => {
      tasksRepository.createTask.mockResolvedValue(mockTask);
      const result = await tasksService.createTask(mockTask, mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateTask', () => {
    it('calls TasksRepository.save and returns the result', async () => {
      const newStatus = TaskStatus.IN_PROGRESS;
      const updatedTask = { ...mockTask, status: newStatus };
      tasksRepository.findOneBy.mockResolvedValue(mockTask);
      tasksRepository.save.mockResolvedValue(updatedTask);
      const result = await tasksService.updateTask(
        'testId',
        { status: newStatus },
        mockUser,
      );
      expect(result).toEqual(updatedTask);
    });
  });
});
