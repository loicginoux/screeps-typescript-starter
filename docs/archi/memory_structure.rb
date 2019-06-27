{
	rooms: [
		roomName: {
      avoid: false,
      miningSites: {
        sourceId: {
          harvesters: [:id],
          truck: [:id],
          container: :id,
        }
      },
      extractorSites: [
        {
          harvesters: [:id],
          truck: [:id],
          container: :id,
          end_cool_down_at: :time,
          pos: [1,2]
        }
      ]
    }
  ],
  currentDirective: :upgrade
	creeps: [
		creepName: {

    }
  ]
}
https://screeps.com/a/#!/room/shard3/W23S25

https://screeps.com/a/#!/room/shard3/W31N24

https://screeps.com/a/#!/room/shard3/W29S26
