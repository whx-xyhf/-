import ellipseForce from './ellipseForce';

import * as React from 'react';
import * as d3 from 'd3';
import { rgb, RGBColor } from 'd3';
import menURL from '../assets/men.png';
import paperURL from '../assets/paper.png';
import widthURL from '../assets/width.png';
import radiusURL from '../assets/radius.png';


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
    public circleR:number=30;
    public circleR_Max:number=35;
    public circleR_Min:number=20;
    public circleFill:RGBColor=rgb(246,196,103);
    public circleStroke:RGBColor=rgb(216,160,25);
    public arcFill:RGBColor=rgb(30,144,255);
    // public circleColor=["#edf8fb","#ccece6","#99d8c9","#66c2a4","#2ca25f","#006d2c"];
    public circleColor=["#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45"];
    public linkWidthMax:number=5;
    public linkWidthMin:number=1;
    public nameFontSize:number=12;
    public padding={top:10,bottom:10,left:10,right:10};
    constructor(props:Props){
        super(props);
        this.svgRef=React.createRef();
        this.state={layOutNodes:[],layOutLinks:[],focusNode:{},isDrag:false,dragId:''};
        this.showInfo=this.showInfo.bind(this);
        this.hideInfo=this.hideInfo.bind(this);
        this.forceLayout=this.forceLayout.bind(this);
        this.zoom=this.zoom.bind(this);
        this.mouseDowm=this.mouseDowm.bind(this);
        this.mouseMove=this.mouseMove.bind(this);
        this.mouseUp=this.mouseUp.bind(this);
        this.onContextMenu=this.onContextMenu.bind(this);
        this.onContext=this.onContext.bind(this);
        this.onSvgContext=this.onSvgContext.bind(this);
    }
    forceLayout(graph:graph,width:number,height:number):void{
        let {nodes,edges,weight}=graph;
        //连线粗细比例尺
        let weight_min_max=d3.extent(weight,(d:any)=>d);
        let weightScale=d3.scaleLinear().domain(weight_min_max as unknown as any).range([this.linkWidthMin,this.linkWidthMax])

        let authorInfo=graph['authorInfo'];
        let cite:Array<number>=[];
        let paper:Array<number>=[];
        let rank:Array<number>=[];
        for(let i in authorInfo){
            cite.push(authorInfo[i]['cite']);
            paper.push(authorInfo[i]['count']);
            rank.push(Math.floor(authorInfo[i]['rank']));
        }
        let cite_min_max=d3.extent(cite);
        let rScale=d3.scaleLinear().domain(cite_min_max as unknown as any).range([this.circleR_Min,this.circleR_Max]);

        let r_min_max=d3.extent(rank);
        let rankScale=d3.scaleLinear().domain(r_min_max as unknown as any).range([0,this.circleColor.length-1]);

        let paper_max=d3.max(paper);

        let nodesid=nodes.map((value:number,index:number)=>{
            let v=rScale(graph['authorInfo'][value]['cite']);
            let p=paper[index] ;
            let pie=null;
            if(paper_max){
                if(p===paper_max)
                    pie=d3.pie().sort(null)([p/paper_max]);
                else
                    pie=d3.pie().sort(null)([p/paper_max ,1-p/paper_max]);
                    let arc_generator=d3.arc().innerRadius(v-5).outerRadius(v);
                let arc=pie.map((value:any)=>arc_generator(value));
                let rv=Math.floor(rankScale(authorInfo[value]['rank']))
                return {id:value,x:0,y:0,rx:v,ry:v,r:v-10,arc:arc,rank:rv>this.circleColor.length-1?this.circleColor.length-1:rv}; 

            }
            else{
                return null;
            }
            
        })

        let links:Array<Link>=edges.map((value:edges,index:number)=>{
            return {source:value[0],target:value[1],width:weightScale(weight[index])};
        });
        // console.log(nodesid,links)
        d3.forceSimulation(nodesid)
        .force("link", d3.forceLink(links).distance(100).id((d:any)=>d.id))
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
    mouseDowm():void{
        this.setState({isDrag:true});
        this.zoom(true);
    }
    mouseMove(e:React.MouseEvent<SVGSVGElement>):void{
        const {layOutNodes,isDrag,dragId}=this.state;
        if(isDrag){
            layOutNodes.forEach((value:any)=>{
                if(String(value.id)===dragId){
                    value.x=e.nativeEvent.offsetX;
                    value.y=e.nativeEvent.offsetY;
                }
            })
            this.setState({layOutNodes:layOutNodes});
        }
        
    }
    mouseUp():void{
        this.setState({isDrag:false});
        this.zoom(false);
    }
    componentDidMount():void{
        this.svgWidth=this.svgRef.current?.clientWidth || 0;
        this.svgHeight=this.svgRef.current?.clientHeight || 0;
        this.forceLayout(this.props.graph,this.svgWidth,this.svgHeight);
        const isDrag=this.state.isDrag;
        this.zoom(isDrag);

        // let svg=d3.select('#svg'+this.props.graph.id)
        // svg.call(d3.zoom()
        // .scaleExtent([0.1,7])
        // .on("zoom",zoomed));
        
        // function zoomed(isDrag:boolean){
        //     let transform = d3.zoomTransform(svg.node());
        //     svg.selectAll("g").attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
        // }
    }
    zoom(isDrag:boolean){
        let svg=d3.select('#svg'+this.props.graph.id)
        if(isDrag){
            svg.call(d3.zoom()
            .scaleExtent([0.1,7])
            .on("zoom",null) as unknown as any);
        }
        else{
            svg.call(d3.zoom()
            .scaleExtent([0.1,7])
            .on("zoom",zoomed) as unknown as any);
        }
        function zoomed(){
            let transform = d3.zoomTransform(svg.node() as unknown as Element);
            svg.selectAll("g").attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
        }
    }
    onContextMenu(e:React.MouseEvent<SVGCircleElement>){
        e.preventDefault();
        e.stopPropagation();
        let isDrag=this.state.isDrag;
        let a=!isDrag;
        this.setState({isDrag:a,dragId:e.currentTarget.id});
        this.zoom(a);
    }
    onContext(e:React.MouseEvent<SVGTextElement>){
        e.preventDefault();
        e.stopPropagation();
        let isDrag=this.state.isDrag;
        let a=!isDrag;
        this.setState({isDrag:a,dragId:e.currentTarget.id});
        this.zoom(a);
    }
    onSvgContext(e:React.MouseEvent<SVGSVGElement>){
        e.preventDefault();
        let isDrag=this.state.isDrag;
        let a=!isDrag;
        this.setState({isDrag:false});
        this.zoom(false);
    }
    componentWillReceiveProps(nextProps:Props):void{
        this.forceLayout(nextProps.graph,this.svgWidth,this.svgHeight);
    }
    
    render():React.ReactElement{
        const {layOutNodes,layOutLinks}=this.state;
        const {graph}=this.props;
        let rankMax=d3.max(layOutNodes,(d:any)=>d.rank) as unknown as number;
        let icons:Array<React.ReactElement>=[];
        let arc:Array<React.ReactElement>=[];
        let rect:Array<React.ReactElement>=[];
        let circle:Array<React.ReactElement>=[];
        let nodes=layOutNodes.map((value:any,index:number)=>{
            icons.push(<image key={index} x={value.x-value.r/2} y={value.y-value.r} width={value.r} height={value.r} xlinkHref={menURL}></image>)
            arc.push(<path key={value.id+'arc0'} d={value.arc[0]} stroke="#ccc" strokeWidth={1} fill={this.circleColor[value.rank]} transform={`translate(${value.x},${value.y})`}></path>)
            arc.push(<path key={value.id+'arc1'} d={value.arc[1]} stroke="#ccc" strokeWidth={1} fill="none" transform={`translate(${value.x},${value.y})`}></path>)
            circle.push(<circle r={value.rx} cx={value.x} cy={value.y} key={index} fill="#fff"></circle>)
            return <circle id={value.id} r={value.r} cx={value.x} cy={value.y} key={index} fill={this.circleColor[value.rank]} strokeWidth="1px" stroke={this.circleStroke.toString()}
            cursor='pointer' onContextMenu={this.onContextMenu} ></circle>
        })

        for(let i=0;i<=rankMax;i++){
            rect.push(<rect key={i} x={this.svgWidth - (this.circleColor.length - i) * 10 - 10} y={this.svgHeight - 15} height={10} width={10} fill={this.circleColor[i]}></rect>)
        }
        
        let names=layOutNodes.map((value:any,index:number)=>{
            if(graph['authorInfo'][value.id]){
                let name=graph['authorInfo'][value.id]['name'];
                // let count=(value.r-1)*2/(this.nameFontSize/2);
                // if(name.length/2*this.nameFontSize>(value.rx-1)*2){
                //     name=name.substr(0,count);
                // }
                return <text id={value.id} onContextMenu={this.onContext} x={value.x-name.length*this.nameFontSize/4} y={value.y+this.nameFontSize/4} key={index} fontSize={this.nameFontSize+'px'}>{name}</text>
            }
            
        })
        
        let links=layOutLinks.map((value:any)=>{
            return <line x1={value.source.x} y1={value.source.y} x2={value.target.x} 
            y2={value.target.y} fill="none" strokeWidth={value.width} stroke="#ccc" key={value.index}></line>
        })
        return (
            <svg ref={this.svgRef} style={{width:'100%',height:'100%'}} onClick={this.props.onClick?this.props.onClick.bind(this.props.parent,this.state.layOutNodes,this.state.layOutLinks,this.props.graph.id):null}
            id={'svg'+this.props.graph.id} onContextMenu={this.onSvgContext} onMouseMove={this.mouseMove}>
                
                <g>{links}</g>
                <g>{circle}</g>
                <g>{nodes}</g>
                <g>{arc}</g>
                <g>{names}</g>
                <g>{icons}</g>
                

                <text x={475} y={this.svgHeight - 7} fontSize="10px">Rank:</text>
                {rect}
                <text x={270} y={this.svgHeight - 7} fontSize="10px">Paper Count:</text>
                <image x={335} y={this.svgHeight - 18} width={15} height={15} xlinkHref={paperURL}></image>
                <text x={400} y={this.svgHeight - 7} fontSize="10px">Weight:</text>
                <image x={440} y={this.svgHeight - 25} width={30} height={30} xlinkHref={widthURL}></image>
                <text x={355} y={this.svgHeight - 7} fontSize="10px">Cite:</text>
                <image x={380} y={this.svgHeight - 18} width={15} height={15} xlinkHref={radiusURL}></image>
            </svg>
        )
    }
}
export default PNodeLink;