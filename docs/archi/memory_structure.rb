Memory ={
  miningSites: {
    sourceId: {
      harvesters: [:id],
      truck: [:id],
      container: :id,
    }
  },
  extractorSites: {
    siteId: {
      harvesters: [:id],
      truck: [:id],
      container: :id,
      end_cool_down_at: :time,
      pos: [1,2]
    }
  },
	rooms: {
		roomName: {
      avoid: false,

    }
  },
  currentDirective: :upgrade,
	creeps: [
		creepName: {

    }
  ]
}
