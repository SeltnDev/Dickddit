//Shard is used to split data.
async function shard(array, chunkSize) {
    const chunks = []
  
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
  
    return chunks
}

module.exports = shard