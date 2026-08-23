import { railProvider } from "@/providers/rail/railProvider";
import { Train, LiveTrainData } from "@/types/train";
import { AppError } from "@/lib/errors";

export class TrainService {
  async search(query: string, runsTodayOnly = false): Promise<Train[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    if (query.trim().length > 50) {
      throw new AppError("INVALID_REQUEST", "Search query is too long.", 400);
    }

    return await railProvider.searchTrains(query, runsTodayOnly);
  }

  async getTrain(idOrNumber: string): Promise<Train> {
    if (!idOrNumber) {
      throw new AppError("INVALID_REQUEST", "Train number or ID is required.", 400);
    }

    const train = await railProvider.getTrainById(idOrNumber);
    if (!train) {
      throw new AppError("TRAIN_NOT_FOUND", `Train '${idOrNumber}' could not be found.`, 404);
    }

    return train;
  }

  async getLiveStatus(idOrNumber: string): Promise<LiveTrainData> {
    if (!idOrNumber) {
      throw new AppError("INVALID_REQUEST", "Train number or ID is required.", 400);
    }

    const liveData = await railProvider.getLiveTrainStatus(idOrNumber);
    if (!liveData) {
      throw new AppError(
        "TRAIN_NOT_FOUND",
        `Live status for train '${idOrNumber}' is currently unavailable.`,
        404
      );
    }

    return liveData;
  }
}

export const trainService = new TrainService();
