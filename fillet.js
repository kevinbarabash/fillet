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
      points: [[300, 300], [300, 10], [10, 10], [10, 300], [300, 300]],
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

    // const v1 = sub(points[1], points[0])
    // const v2 = sub(points[1], points[2])

    // console.log(`v1 = ${v1}`)
    // console.log(`v2 = ${v2}`)
    // console.log(`dot = ${dot(v2, v1)}`)

    // TODO: determine the line connect all of the fillets
    // TODO: define a complete path
    // TODO: allow different sizes of fillets
    // TODO: warn when fillets cause an discontinuous path

    const fillets = []
    const fr = 30

    for (let i = 0; i < points.length - 2; i++) {
      const v1 = sub(points[i+1], points[i+0])
      const v2 = sub(points[i+1], points[i+2])

      const angle = Math.acos(dot(v1, v2) / (length(v1) * length(v2)))
      const cp = cross(v1, v2);
      const hyp = 30 / Math.sin(angle / 2)
      const adj = Math.cos(angle / 2) * hyp
      const start = add(points[i+1], scale(adj, unit(sub(points[i+0], points[i+1]))))
      const end = add(points[i+1], scale(adj, unit(sub(points[i+2], points[i+1]))))

      fillets.push({start, end, cp})
    }

    return <svg
      width="800"
      height="600"
      onMouseDown={this.handleMouseDown}
      onMouseMove={this.handleMouseMove}
      onMouseUp={this.handleMouseUp}
    >
      <polyline fill='none' stroke='black' points={pointStr}/>
      {fillets.map(({start, end, cp}) =>
        <path fill='none' stroke='black' d={`M${start[0]} ${start[1]} A ${fr} ${fr} 0 0 ${cp > 0 ? 0 : 1} ${end[0]} ${end[1]}`}/>
      )}
    </svg>
  }
}


ReactDOM.render(<Scene />, document.getElementById('example'))
