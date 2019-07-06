export function roadPlanner(spawnPos: RoomPosition) {
  return {
    "name": "textExport",
    "rcl": "3",
    "buildings": {
      "road": {
        "pos": [
          { "x": spawnPos.x, "y": spawnPos.y - 7 },
          // { "x": spawnPos.x - 6, "y": spawnPos.y - 6 },
          { "x": spawnPos.x - 1, "y": spawnPos.y - 6 },
          { "x": spawnPos.x + 1, "y": spawnPos.y - 6 },
          // { "x": spawnPos.x + 6, "y": spawnPos.y - 6 },

          // { "x": spawnPos.x - 5, "y": spawnPos.y - 5 },
          { "x": spawnPos.x - 2, "y": spawnPos.y - 5 },
          { "x": spawnPos.x + 2, "y": spawnPos.y - 5 },
          // { "x": spawnPos.x + 5, "y": spawnPos.y - 5 },

          { "x": spawnPos.x - 4, "y": spawnPos.y - 4 },
          { "x": spawnPos.x - 3, "y": spawnPos.y - 4 },
          { "x": spawnPos.x - 1, "y": spawnPos.y - 4 },
          { "x": spawnPos.x + 1, "y": spawnPos.y - 4 },
          { "x": spawnPos.x + 3, "y": spawnPos.y - 4 },
          { "x": spawnPos.x + 4, "y": spawnPos.y - 4 },

          { "x": spawnPos.x - 4, "y": spawnPos.y - 3 },
          { "x": spawnPos.x - 3, "y": spawnPos.y - 3 },
          { "x": spawnPos.x + 3, "y": spawnPos.y - 3 },
          { "x": spawnPos.x + 4, "y": spawnPos.y - 3 },

          { "x": spawnPos.x - 5, "y": spawnPos.y - 2 },
          { "x": spawnPos.x - 2, "y": spawnPos.y - 2 },
          { "x": spawnPos.x + 2, "y": spawnPos.y - 2 },
          { "x": spawnPos.x + 5, "y": spawnPos.y - 2 },

          { "x": spawnPos.x - 6, "y": spawnPos.y - 1 },
          { "x": spawnPos.x - 4, "y": spawnPos.y - 1 },
          { "x": spawnPos.x - 1, "y": spawnPos.y - 1 },
          { "x": spawnPos.x, "y": spawnPos.y - 1 },
          { "x": spawnPos.x + 1, "y": spawnPos.y - 1 },
          { "x": spawnPos.x + 4, "y": spawnPos.y - 1 },
          { "x": spawnPos.x + 6, "y": spawnPos.y - 1 },

          { "x": spawnPos.x - 7, "y": spawnPos.y },
          { "x": spawnPos.x - 1, "y": spawnPos.y },
          { "x": spawnPos.x + 1, "y": spawnPos.y },
          { "x": spawnPos.x + 7, "y": spawnPos.y },

          { "x": spawnPos.x - 6, "y": spawnPos.y + 1 },
          { "x": spawnPos.x - 4, "y": spawnPos.y + 1 },
          { "x": spawnPos.x - 1, "y": spawnPos.y + 1 },
          { "x": spawnPos.x, "y": spawnPos.y + 1 },
          { "x": spawnPos.x + 1, "y": spawnPos.y + 1 },
          { "x": spawnPos.x + 4, "y": spawnPos.y + 1 },
          { "x": spawnPos.x + 6, "y": spawnPos.y + 1 },

          { "x": spawnPos.x - 5, "y": spawnPos.y + 2 },
          { "x": spawnPos.x - 2, "y": spawnPos.y + 2 },
          { "x": spawnPos.x + 2, "y": spawnPos.y + 2 },
          { "x": spawnPos.x + 5, "y": spawnPos.y + 2 },

          { "x": spawnPos.x - 4, "y": spawnPos.y + 3 },
          { "x": spawnPos.x - 3, "y": spawnPos.y + 3 },
          { "x": spawnPos.x + 3, "y": spawnPos.y + 3 },
          { "x": spawnPos.x + 4, "y": spawnPos.y + 3 },

          { "x": spawnPos.x - 4, "y": spawnPos.y + 4 },
          { "x": spawnPos.x - 3, "y": spawnPos.y + 4 },
          { "x": spawnPos.x - 1, "y": spawnPos.y + 4 },
          { "x": spawnPos.x + 1, "y": spawnPos.y + 4 },
          { "x": spawnPos.x + 3, "y": spawnPos.y + 4 },
          { "x": spawnPos.x + 4, "y": spawnPos.y + 4 },

          // { "x": spawnPos.x - 5, "y": spawnPos.y + 5 },
          { "x": spawnPos.x - 2, "y": spawnPos.y + 5 },
          { "x": spawnPos.x + 2, "y": spawnPos.y + 5 },
          // { "x": spawnPos.x + 5, "y": spawnPos.y + 5 },

          // { "x": spawnPos.x - 6, "y": spawnPos.y + 6 },
          { "x": spawnPos.x - 1, "y": spawnPos.y + 6 },
          { "x": spawnPos.x + 1, "y": spawnPos.y + 6 },
          // { "x": spawnPos.x + 6, "y": spawnPos.y + 6 },
          { "x": spawnPos.x, "y": spawnPos.y + 7 }
        ]
      },
    }
  }
}
