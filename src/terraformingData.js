export class DataStore {
  constructor() {
    this.data = {};
  }

  set(chunkX, chunkZ, blockX, blockY, blockZ, blockId) {
    const key = this.genarteKey(chunkX, chunkZ, blockX, blockY, blockZ);
    this.data[key] = blockId;
  }

  genarteKey(chunkX, chunkZ, blockX, blockY, blockZ) {
    return `${chunkX}-${chunkZ}-${blockX}-${blockY}-${blockZ}`;
  }

  contains(chunkX, chunkZ, blockX, blockY, blockZ) {
    const key = this.genarteKey(chunkX, chunkZ, blockX, blockY, blockZ);
    return this.data[key] !== undefined;
  }

  get(chunkX, chunkZ, blockX, blockY, blockZ) {
    const key = this.genarteKey(chunkX, chunkZ, blockX, blockY, blockZ);
    const blockId = this.data[key];
    return blockId;
  }

  clear() {
    this.data = {};
  }
}
