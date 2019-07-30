export function roadDistrictPlanner(center: RoomPosition) {
  return {
    "buildings": {
      "road": {
        "pos": [
          { "x": center.x, "y": center.y - 2 },
          { "x": center.x - 1, "y": center.y - 1 },
          { "x": center.x + 1, "y": center.y - 1 },
          { "x": center.x - 2, "y": center.y },
          { "x": center.x + 2, "y": center.y },
          { "x": center.x - 1, "y": center.y + 1 },
          { "x": center.x + 1, "y": center.y + 1 },
          { "x": center.x, "y": center.y + 2 }
        ]
      },
    }
  }
}
