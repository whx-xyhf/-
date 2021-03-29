import * as React from 'react';
import * as d3 from 'd3';

type tree={
    id:number,
    [propName:string]:any,
}


interface Props{
    graph:tree,
    [propName: string]: any;
}

class TargetTree extends React.Component<Props,any>{
    private svgRef:React.RefObject<SVGSVGElement>;
    private svgWidth:number=0;
    private svgHeight:number=0;
    private padding={top:10,bottom:10,left:20,right:10};
    private circleR=3.5;
    constructor(props:Props){
        super(props);
        this.svgRef=React.createRef();
        this.state={layOutNodes:[],layOutLinks:[],focusNode:{}};
        this.showInfo=this.showInfo.bind(this);
        this.hideInfo=this.hideInfo.bind(this);
    }
    treeLayout(tree:tree,height:number,width:number):void{
        let treeData=d3.tree().size([height-this.padding.top,width-this.padding.left])(d3.hierarchy(tree));
        let treeDataLinks=treeData.links();
        let createLink=d3.linkHorizontal()  //d3.linkVertical()  d3.linkHorizontal().x(d => d.y).y(d => d.x)
                .x((d:any) =>d.y)
                .y((d:any) =>d.x)
        treeDataLinks.forEach((value:any)=>{
            value.d=createLink(value);
        })
        let treeDataNodes=treeData.descendants();
        
        this.setState({layOutNodes:treeDataNodes,layOutLinks:treeDataLinks});
    }
    showInfo(data:any):void{
        this.setState({focusNode:data});
    }
    hideInfo():void{
        this.setState({focusNode:{}});
    }
    componentDidMount():void{
        this.svgWidth=this.svgRef.current?.clientWidth || 0;
        this.svgHeight=this.svgRef.current?.clientHeight || 0;
        this.treeLayout(this.props.graph,this.svgHeight,this.svgWidth);
    }
    componentWillReceiveProps(nextProps:Props):void{
        this.treeLayout(nextProps.graph,this.svgHeight,this.svgWidth);
    }
    render():React.ReactElement{
        // console.log(this.state.layOutNodes)
        let nodes=this.state.layOutNodes.map((value:any,index:number)=>{
            return <circle r={this.circleR} cx={value.y} cy={value.x} key={index} fill={this.props.circleFill?this.props.circleFill:'#ccc'} strokeWidth="1px" stroke="white"
            onMouseOver={this.showInfo.bind(this,value)} onMouseOut={this.hideInfo} cursor='pointer'></circle>
        })
        let links=this.state.layOutLinks.map((value:any,index:number)=>{
            return <path d={value.d} fill="none" strokeWidth="1px" stroke={this.props.stroke?this.props.stroke:'#ccc'} key={index}></path>
        })
        return (
            <svg ref={this.svgRef} style={{width:'100%',height:'100%'}} onClick={this.props.onClick?this.props.onClick.bind(this.props.parent,this.props.graph):null}>
                <text x="0"y='20'>{this.props.graph.year}</text>
                <g transform='translate(10,0)'>{links}</g>
                <g transform='translate(10,0)'>{nodes}</g>
                <text x={this.state.focusNode.x?this.state.focusNode.x:null} y={this.state.focusNode.y?this.state.focusNode.y:null} fontSize='0.6rem'>
                    {this.props.graph.names?this.props.graph.names[this.state.focusNode.id]:''}
                </text>
            </svg>
        )
    }
}

export default TargetTree;