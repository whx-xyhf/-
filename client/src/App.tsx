import React from 'react';
import './App.css';
import ScatterPlot from './components/ScatterPlot';
import ForceCompute from './components/ForceCompute';
import NodeList from './components/NodeList';
import Info from './components/Info';
// import * as axios from 'axios'
// import  * as d3 from 'd3';

type ChoosePointData ={
  id: number,
  nodes: Array<number>,
  edges:Array<edges>,
  [propName:string]:any,
}
type edges=Array<number>;

class App extends React.Component<any,any> {
  constructor(props:any){
    super(props)
    this.state={
      choosePoints:[],//圈选的点
      personGraphs:[],//选中的人所在的子图
    }
    this.setChoosePoints=this.setChoosePoints.bind(this);
    this.setPersonGraphs=this.setPersonGraphs.bind(this);
  }
  setChoosePoints(data:ChoosePointData){
    this.setState({choosePoints:data});
  }
  setPersonGraphs(data:ChoosePointData){
    this.setState({personGraphs:data});
  }
  render():React.ReactElement{
    return (
      <div className="App">
        <div className="controlView">
          <NodeList url="http://localhost:8080" parent={this.setPersonGraphs.bind(this)}/>
        </div>
        <div className="infoView">
          <Info graphs={this.state.personGraphs} url='http://localhost:8080/matchGraph' num={20} parent={this.setChoosePoints.bind(this)}/>
        </div>
        <div className="scatterView">
          <ScatterPlot url="http://localhost:8080" parent={this.setChoosePoints.bind(this)}/>
        </div>
        <div className="forceComputeView">
          <ForceCompute graphs={this.state.choosePoints}/>
        </div>
      </div>
    );
  }
  
}

export default App;
