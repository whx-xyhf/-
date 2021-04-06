import * as React from 'react';
import * as d3 from 'd3';

//定义边数组
type edges=Array<number>;

interface Props{
    graph:{
        id:number,
        // nodes:Array<number>,
        // edges:Array<edges>,
        [propName:string]:any,
    },
    [propName: string]: any;
}
interface Link{
    source:any,
    target:any,
    [propName: string]: any;
}

class NodeLink extends React.Component<Props,any>{
    private svgRef:React.RefObject<SVGSVGElement>;
    public svgWidth:number=0;
    public svgHeight:number=0;
    public padding={top:10,bottom:10,left:10,right:10};
    public circleR:string="3.5px";
    constructor(props:Props){
        super(props);
        this.svgRef=React.createRef();
        this.state={layOutNodes:[],layOutLinks:[]};
        this.forceLayout=this.forceLayout.bind(this);
    }
    forceLayout(nodes:Array<number>,edges:Array<edges>,width:number,height:number):void{
        let nodesid=nodes.map((value:number)=>{
            return {id:value,x:0,y:0};
        })

        let links:Array<Link>=edges.map((value:edges)=>{
            return {source:value[0],target:value[1]};
        });
        // console.log(nodesid,links)
        d3.forceSimulation(nodesid)
        .force("link", d3.forceLink(links).id((d:any)=>d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on('tick', function () {
            // console.log("waiting...");
        })
        .on("end",()=>{
            // console.log("布局完成！");
            // console.log(links)
            let x_max:number=d3.max(nodesid,(d:d3.SimulationNodeDatum):number=>d.x || 0) || 0;
            let x_min:number=d3.min(nodesid,(d:d3.SimulationNodeDatum):number=>d.x || 0) || 0;
            let y_max:number=d3.max(nodesid,(d:d3.SimulationNodeDatum):number=>d.y || 0) || 0;
            let y_min:number=d3.min(nodesid,(d:d3.SimulationNodeDatum):number=>d.y || 0) || 0;
            
            
                
                new Promise((resolve:any,reject:any)=>{
                    //获取纵横比
                    let height_force=y_max-y_min;
                    let width_force=x_max-x_min;
                    let scaleWidth=this.svgWidth/4*3;
                    let scaleHeight=this.svgHeight/4*3;
                    if(x_max>=this.svgWidth || x_min<=0 || y_min<=0 || y_max>=this.svgHeight){
                        scaleWidth=this.svgWidth;
                        scaleHeight=this.svgHeight;
                    }
                    
                    if(height_force>width_force){
                        scaleWidth=(scaleHeight*width_force)/height_force;
                        if(scaleWidth>this.svgWidth){
                            scaleWidth=this.svgWidth;
                            scaleHeight=(scaleWidth*height_force)/width_force;
                        }
                    }
                    else{
                        scaleHeight=(scaleWidth*height_force)/width_force;
                        if(scaleHeight>this.svgHeight){
                            scaleHeight=this.svgHeight;
                            scaleWidth=(scaleHeight*width_force)/height_force;
                        }
                    }
                    let xScale: d3.ScaleLinear<number, number>=d3.scaleLinear().domain([x_min,x_max]).range([(this.svgWidth-scaleWidth)/2+this.padding.left,(this.svgWidth-scaleWidth)/2+scaleWidth-this.padding.right]);
                    let yScale: d3.ScaleLinear<number, number>=d3.scaleLinear().domain([y_min,y_max]).range([(this.svgHeight-scaleHeight)/2+this.padding.top,(this.svgHeight-scaleHeight)/2+scaleHeight-this.padding.bottom]);
                    
                    
                    let newNodes=[];
                    for(let i=0;i<nodesid.length;i++){
                        newNodes.push({
                            id:nodesid[i].id,
                            x:xScale(nodesid[i].x),
                            y:yScale(nodesid[i].y)
                        })
                    }
                   
                    let newLinks=[];
                    for(let i=0;i<links.length;i++){
                        newLinks.push({
                            index:links[i].index,
                            source:{id:links[i].source.id,x:xScale(links[i].source.x),y:yScale(links[i].source.y)},
                            target:{id:links[i].target.id,x:xScale(links[i].target.x),y:yScale(links[i].target.y)}
                        })
                    }
                    
                    resolve([newNodes,newLinks]);
                }).then((res:any)=>{
                    // console.log(res[0])
                    this.setState({layOutNodes:res[0],layOutLinks:res[1]});
                })
            
            // else{
                
            //     this.setState({layOutNodes:nodesid,layOutLinks:links});
            // }
            
            // this.setState({layOutNodes:nodesid,layOutLinks:links});
        })
    }
    componentDidMount():void{
        this.svgWidth=this.svgRef.current?.clientWidth || 0;
        this.svgHeight=this.svgRef.current?.clientHeight || 0;
        this.forceLayout(this.props.graph.nodes,this.props.graph.edges,this.svgWidth,this.svgHeight);
    }
    componentWillReceiveProps(nextProps:Props):void{
        this.forceLayout(nextProps.graph.nodes,nextProps.graph.edges,this.svgWidth,this.svgHeight);
    }
    render():React.ReactElement{
        // console.log(this.state.layOutNodes)
        const {layOutNodes,layOutLinks,focusNode}=this.state;
        let nodes=layOutNodes.map((value:any,index:number)=>{
            return <circle r={this.circleR} cx={value.x} cy={value.y} key={index} fill={this.props.circleFill?this.props.circleFill:'#ccc'} strokeWidth="1px" stroke="white" cursor='pointer'></circle>
        })
        let links=layOutLinks.map((value:any)=>{
            return <line x1={value.source.x} y1={value.source.y} x2={value.target.x} 
            y2={value.target.y} fill="none" strokeWidth="1px" stroke={this.props.stroke?this.props.stroke:'#ccc'} key={value.index}></line>
        })
        return (
            <svg ref={this.svgRef} style={{width:'100%',height:'100%'}} onClick={this.props.onClick?this.props.onClick.bind(this.props.parent,this.props.graph,this.state.layOutNodes,this.state.layOutLinks,this.props.graph.id):null}>
                {/* <text x="0"y='20'>{this.props.graph.year}</text> */}
                <g>{links}</g>
                <g>{nodes}</g>
                {/* <text x={focusNode.x?focusNode.x:null} y={focusNode.y?focusNode.y:null} fontSize='0.6rem'>
                    {focusNode.id?this.props.graph['authorInfo'][focusNode.id]['name']:''}
                </text> */}
            </svg>
        )
    }
}
export default NodeLink;