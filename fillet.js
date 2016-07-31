const {Component} = React;

const distance = (p1, p2) => Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2))
const length = (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1])
const sub = (v2, v1) => [v2[0] - v1[0], v2[1] - v1[1]]
const dot = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1]
const mid = (p1, p2) => [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]
const scale = (k, v) => [k * v[0], k * v[1]]
const add = (v1, v2) => [v1[0] + v2[0], v1[1] + v2[1]]
const unit = (v) => scale(1 / length(v), v)
const cross = (u, v) => u[0] * v[1] - u[1] * v[0]


class Scene extends Component {
  constructor(props) {
    super(props)

    this.state = {
      points: [[300, 300], [300, 10], [10, 10], [10, 300]],
      selection: -1,
    }

    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
  }

  handleMouseDown(e) {
    const mouse = [e.pageX, e.pageY]
    this.state.points.forEach((point, i) => {
      if (distance(point, mouse) < 5) {
        this.setState({selection: i})
      }
    })
  }

  handleMouseMove(e) {
    if (this.state.selection !== -1) {
      const i = this.state.selection
      const mouse = [e.pageX, e.pageY]
      const points = this.state.points

      this.setState({
        points: [...points.slice(0,i), mouse, ...points.slice(i+1)]
      })
    }
  }

  handleMouseUp(e) {
    this.setState({selection: -1})
  }

  render() {
    const {points} = this.state;
    const pointStr = points.map((point) => point.join(' ')).join(' ')

    // TODO: allow different sizes of fillets
    // TODO: warn when fillets cause an discontinuous path

    const fillets = []
    const fr = 30

    const len = points.length;
    for (let i = 0; i < points.length; i++) {
      const v1 = sub(points[(i+1) % len], points[(i+0) % len])
      const v2 = sub(points[(i+1) % len], points[(i+2) % len])

      const angle = Math.acos(dot(v1, v2) / (length(v1) * length(v2)))
      const cp = cross(v1, v2);
      const hyp = 30 / Math.sin(angle / 2)
      const adj = Math.cos(angle / 2) * hyp
      const start = add(points[(i+1) % len], scale(adj, unit(sub(points[(i+0) % len], points[(i+1) % len]))))
      const end = add(points[(i+1) % len], scale(adj, unit(sub(points[(i+2) % len], points[(i+1) % len]))))

      fillets.push({start, end, cp})
    }

    // <polyline fill='none' stroke='black' points={pointStr}/>

    const lines = [];
    for (let i = 0; i < fillets.length; i++) {
      const f1 = fillets[i];
      const f2 = fillets[(i+1) % fillets.length];

      lines.push({
        x1: f1.end[0],
        y1: f1.end[1],
        x2: f2.start[0],
        y2: f2.start[1],
      })
    }

    return <svg
      width="800"
      height="600"
      onMouseDown={this.handleMouseDown}
      onMouseMove={this.handleMouseMove}
      onMouseUp={this.handleMouseUp}
    >
      {points.map((point) => <circle cx={point[0]} cy={point[1]} r='5'/>)}
      {fillets.map(({start, end, cp}) =>
        <path fill='none' stroke='black' d={`M${start[0]} ${start[1]} A ${fr} ${fr} 0 0 ${cp > 0 ? 0 : 1} ${end[0]} ${end[1]}`}/>
      )}
      {lines.map((line) => <line stroke='black' {...line}/>)}
    </svg>
  }
}


ReactDOM.render(<Scene />, document.getElementById('example'))
