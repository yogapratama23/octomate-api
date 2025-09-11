import { Test, TestingModule } from '@nestjs/testing';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { CreateVoteDto, CastVoteDto } from './votes.dto';

describe('VotesController', () => {
  let controller: VotesController;
  let service: VotesService;

  beforeEach(async () => {
    const mockVotesService = {
      createVote: jest.fn(),
      castVote: jest.fn(),
      getVote: jest.fn(),
      getVotes: jest.fn(),
      getVoteResult: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VotesController],
      providers: [{ provide: VotesService, useValue: mockVotesService }],
    }).compile();

    controller = module.get<VotesController>(VotesController);
    service = module.get<VotesService>(VotesService);
  });

  describe('createVote', () => {
    it('should call service.createVote with body', async () => {
      const dto: CreateVoteDto = {
        title: 'Test',
        description: 'Desc',
        options: ['A', 'B'],
      };
      const expected = { id: '1', ...dto };

      (service.createVote as jest.Mock).mockResolvedValue(expected);

      const result = await controller.createVote(dto);

      expect(service.createVote).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('castVote', () => {
    it('should call service.castVote with userId, slug, and body', async () => {
      const dto: CastVoteDto = { name: 'A' };
      const user = { sub: 'user123' };
      const slug = 'vote-slug';
      const expected = { message: 'your have voted successfully' };

      (service.castVote as jest.Mock).mockResolvedValue(expected);

      const result = await controller.castVote(user, slug, dto);

      expect(service.castVote).toHaveBeenCalledWith(
        'user123',
        'vote-slug',
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('getVote', () => {
    it('should call service.getVote with slug', async () => {
      const slug = 'vote-slug';
      const expected = { id: '1', title: 'Test' };

      (service.getVote as jest.Mock).mockResolvedValue(expected);

      const result = await controller.getVote(slug);

      expect(service.getVote).toHaveBeenCalledWith(slug);
      expect(result).toEqual(expected);
    });
  });

  describe('getVotes', () => {
    it('should call service.getVotes', async () => {
      const expected = [
        { id: '1', title: 'Vote 1' },
        { id: '2', title: 'Vote 2' },
      ];

      (service.getVotes as jest.Mock).mockResolvedValue(expected);

      const result = await controller.getVotes();

      expect(service.getVotes).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('getVoteResult', () => {
    it('should call service.getVoteResult with slug', async () => {
      const slug = 'vote-slug';
      const expected = { id: '1', title: 'Vote 1', results: [] };

      (service.getVoteResult as jest.Mock).mockResolvedValue(expected);

      const result = await controller.getVoteResult(slug);

      expect(service.getVoteResult).toHaveBeenCalledWith(slug);
      expect(result).toEqual(expected);
    });
  });
});
