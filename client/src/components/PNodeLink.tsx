import ellipseForce from './ellipseForce';

import * as React from 'react';
import * as d3 from 'd3';
import { rgb, RGBColor } from 'd3';
import menURL from '../assets/men.png';


//定义边数组
type edges=Array<number>;
type graph={
    id:number,
        // nodes:Array<number>,
        // edges:Array<edges>,
    [propName:string]:any,
}

interface Props{
    graph:graph,
    [propName: string]: any;
}
interface Link{
    source:any,
    target:any,
    [propName: string]: any;
}

class PNodeLink extends React.Component<Props,any>{
    private svgRef:React.RefObject<SVGSVGElement>;
    public svgWidth:number=0;
    public svgHeight:number=0;
    public circleR:number=25;
    public circleFill:RGBColor=rgb(246,196,103);
    public circleStroke:RGBColor=rgb(216,160,25);
    public linkWidthMax:number=5;
    public linkWidthMin:number=1;
    public nameFontSize:number=6;
    public padding={top:10,bottom:10,left:10,right:10};
    constructor(props:Props){
        super(props);
        this.svgRef=React.createRef();
        this.state={layOutNodes:[],layOutLinks:[],focusNode:{}};
        this.showInfo=this.showInfo.bind(this);
        this.hideInfo=this.hideInfo.bind(this);
        this.forceLayout=this.forceLayout.bind(this);
    }
    forceLayout(graph:graph,width:number,height:number):void{
        let {nodes,edges,weight}=graph;
        //连线粗细比例尺
        let weight_min_max=d3.extent(weight,(d:any)=>d);
        let weightScale=d3.scaleLinear(weight_min_max,[this.linkWidthMin,this.linkWidthMax])
        let nodesid=nodes.map((value:number)=>{
            return {id:value,x:0,y:0,rx:this.circleR,ry:this.circleR};
        })

        let links:Array<Link>=edges.map((value:edges,index:number)=>{
            return {source:value[0],target:value[1],width:weightScale(weight[index])};
        });
        // console.log(nodesid,links)
        d3.forceSimulation(nodesid)
        .force("link", d3.forceLink(links).distance(100).id(d=>d.id))
        .force("collide", ellipseForce())
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on('tick', function () {
            // console.log("waiting...");
        })
        .on("end",()=>{
            this.setState({layOutNodes:nodesid,layOutLinks:links});
        })
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
        this.forceLayout(this.props.graph,this.svgWidth,this.svgHeight);
        let svg=d3.select('#svg'+this.props.graph.id)
        svg.call(d3.zoom()
        .scaleExtent([0.1,7])
        .on("zoom",zoomed));
        
        function zoomed(){
            let transform = d3.zoomTransform(svg.node());
            //svg_point.selectAll("circle").attr("r",1);
            svg.selectAll("g").attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
        }
    }
    componentWillReceiveProps(nextProps:Props):void{
        this.forceLayout(nextProps.graph,this.svgWidth,this.svgHeight);
    }
    render():React.ReactElement{
        const {layOutNodes,layOutLinks,focusNode}=this.state;
        const {graph}=this.props;
        let icons:Array<React.ReactElement>=[];
        let nodes=layOutNodes.map((value:any,index:number)=>{
            icons.push(<image key={index} x={value.x-this.circleR/1.5/2} y={value.y-this.circleR/1.5-5} width={this.circleR/1.5} height={this.circleR/1.5} xlinkHref={menURL}></image>)
            return <circle r={this.circleR} cx={value.x} cy={value.y} key={index} fill={this.circleFill.toString()} strokeWidth="1px" stroke={this.circleStroke.toString()}
            onMouseOver={this.showInfo.bind(this,value)} onMouseOut={this.hideInfo} cursor='pointer'></circle>
        })
        
        let names=layOutNodes.map((value:any,index:number)=>{
            if(graph['authorInfo'][value.id]){
                let name=graph['authorInfo'][value.id]['name'];
                let count=(this.circleR-1)*2/(this.nameFontSize/2);
                if(name.length/2*this.nameFontSize>(this.circleR-1)*2){
                    name=name.substr(0,count);
                }
                return <text x={value.x-name.length*this.nameFontSize/4} y={value.y+this.nameFontSize/4} key={index} fontSize={this.nameFontSize+'px'}>{name}</text>
            }
            
        })
        // let cites=layOutNodes.map((value:any,index:number)=>{
        //     let a=[];
        //     if(graph['authorInfo'][value.id]){
        //         let cite=graph['authorInfo'][value.id]['cite'];
        //         let middle=cite/2;
        //         for(let i=0;i<cite;i++){

        //             a.push(<image x={value.x+2*(i-middle)} y={value.y-this.circleR/2-5} width={this.circleR/2} height={this.circleR/2} xlinkHref={menURL}></image>)
        //         }
        //         return a;
        //     }
        // })
        let links=layOutLinks.map((value:any)=>{
            return <line x1={value.source.x} y1={value.source.y} x2={value.target.x} 
            y2={value.target.y} fill="none" strokeWidth={value.width} stroke="#ccc" key={value.index}></line>
        })
        return (
            <svg ref={this.svgRef} style={{width:'100%',height:'100%'}} onClick={this.props.onClick?this.props.onClick.bind(this.props.parent,this.state.layOutNodes,this.state.layOutLinks,this.props.graph.id):null}
            id={'svg'+this.props.graph.id}>
                {/* <image width="100" height="100" xlinkHref={lineURL}></image> */}
                <g>{links}</g>
                <g>{nodes}</g>
                <g>{names}</g>
                <g>{icons}</g>
            </svg>
        )
    }
}
export default PNodeLink;