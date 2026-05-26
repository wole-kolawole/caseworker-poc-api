import { query, execute } from '../db/connection';
import * as taskService from '../services/taskService';

jest.mock('../db/connection');

const mockedConnection = {
  query: query as jest.Mock,
  execute: execute as jest.Mock,
};

describe('taskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes dueDate and defaults description when creating a task', async () => {
    mockedConnection.query.mockResolvedValue([
      {
        id: 1,
        title: 'New task',
        description: '',
        status: 'pending',
        dueDate: '2026-06-01T12:00:00',
        createdAt: '2026-05-26T12:00:00.000Z',
        updatedAt: '2026-05-26T12:00:00.000Z',
      },
    ]);

    const payload = {
      title: 'New task',
      status: 'pending' as const,
      dueDate: '2026-06-01T12:00',
    };

    const task = await taskService.createTask(payload);

    expect(mockedConnection.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        title: payload.title,
        description: '',
        status: payload.status,
        dueDate: '2026-06-01T12:00:00',
      }),
    );
    expect(task).toEqual(expect.objectContaining({ id: 1, title: 'New task' }));
  });

  it('returns null when no task exists for getTaskById', async () => {
    mockedConnection.query.mockResolvedValue([]);

    const task = await taskService.getTaskById(999);

    expect(task).toBeNull();
    expect(mockedConnection.query).toHaveBeenCalledWith(expect.any(String), { id: 999 });
  });

  it('returns null when updateTaskStatus does not update any row', async () => {
    mockedConnection.query.mockResolvedValue([]);

    const task = await taskService.updateTaskStatus(999, { status: 'completed' });

    expect(task).toBeNull();
    expect(mockedConnection.query).toHaveBeenCalledWith(expect.any(String), {
      id: 999,
      status: 'completed',
    });
  });

  it('returns false when deleteTask does not remove a row', async () => {
    mockedConnection.execute.mockResolvedValue({ recordset: [], rowsAffected: [0] });

    const deleted = await taskService.deleteTask(999);

    expect(deleted).toBe(false);
    expect(mockedConnection.execute).toHaveBeenCalledWith(expect.any(String), { id: 999 });
  });

  it('returns true when deleteTask removes a row', async () => {
    mockedConnection.execute.mockResolvedValue({ recordset: [], rowsAffected: [1] });

    const deleted = await taskService.deleteTask(1);

    expect(deleted).toBe(true);
    expect(mockedConnection.execute).toHaveBeenCalledWith(expect.any(String), { id: 1 });
  });
});
