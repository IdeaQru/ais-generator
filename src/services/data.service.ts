interface DataPayload {
  roll: number;
  pitch: number;
  yaw: number;
  heading: number;
  cardinalDirection: string;
  latitude: string;
  longitude: string;
  timestamp?: Date;
}

class DataService {
  private dataStore: DataPayload[]= [];

  getAllData(): DataPayload[] {
    return this.dataStore;
  }

  saveData(data: DataPayload): DataPayload {
    const newData = { ...data, timestamp: new Date() };
    this.dataStore.push(newData);
    return newData;
  }
}

export default new DataService();
