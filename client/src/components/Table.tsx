import * as React from 'react';
import NodeLink from './NodeLink';
import TargetTree from './TargetTree';
import {linkHorizontal,line} from "d3";
import * as d3 from 'd3';
// import SangJi from './SangJi';


interface Props {
    display: boolean;
    parent: any,
    dataType: string,
    changePage: any,
    attrWeight: number,
    strWeight: number,
    graphs: Array<graph>,
}
type graph = {
    id: number,
    // nodes:Array<number>,
    // edges:Array<edges>,
    [propName: string]: any,
}

class Table extends React.Component<Props, any>{
    public svgWidth=0;
    public svgHeight=0;
    public StrokeWidth=5;
    public rectWidth=5;
    public padding={top:10,bottom:10,left:50,right:10};
    public color = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"]
    constructor(props: Props) {
        super(props);
        this.state = { data: [] ,focus:""};
        this.MouseOver=this.MouseOver.bind(this);
        this.MouseOut=this.MouseOut.bind(this);
    }

    componentDidMount(): void {
        this.svgHeight=document.getElementById("authorInfo")?.clientHeight || 0;
        this.svgWidth=document.getElementById("authorInfo")?.clientWidth || 0;
    }
    componentWillReceiveProps(nextProps: Props): void {
        if (nextProps.graphs !== this.props.graphs && nextProps.dataType === "Author") {
            this.setState({ data: nextProps.graphs })
        }
    }
    createLink(){
        return linkHorizontal()  //d3.linkVertical()  d3.linkHorizontal().x(d => d.y).y(d => d.x)
                .x((d:any) =>d[0])
                .y((d:any) =>d[1])
    }
    MouseOver(name:string){
        this.setState({focus:name});

    }
    MouseOut(){
        this.setState({focus:""});
    }
    render(): React.ReactElement {
        let width=this.svgWidth-this.padding.top-this.padding.bottom;
        let height=this.svgHeight-this.padding.top-this.padding.bottom;
        let elements = this.state.data.map((graph: graph, index: number) => {
            // let el = null;
            // let author: Array<React.ReactElement> = [];
            let authorsEl: Array<React.ReactElement> = [];
            let titlesEl:Array<React.ReactElement> = [];
            let links:Array<React.ReactElement> = [];
            let rects:Array<React.ReactElement> = [];
            let authorNames:Array<string>=[];
            let titles:Array<string>=[];
            let linksData:Array<Array<string>>=[];
            if (this.props.dataType === "Author") {
                // el = <NodeLink graph={graph} key={index} />;
                for (let i in graph['authorInfo']) {
                    authorNames.push(graph["authorInfo"][i]["name"]);
                    // let title: Array<React.ReactElement> = [];
                    for (let paper in graph["authorInfo"][i]["paper"]) {
                        if(titles.indexOf(graph["authorInfo"][i]["paper"][paper]["title"])<0){
                            titles.push(graph["authorInfo"][i]["paper"][paper]["title"])
                        }
                        if(linksData.indexOf([graph["authorInfo"][i]["name"],graph["authorInfo"][i]["paper"][paper]["title"]])<0){
                            linksData.push([graph["authorInfo"][i]["name"],graph["authorInfo"][i]["paper"][paper]["title"]]);
                        }
                        // title.push(
                        //     <div className="paperInfo">
                        //         {graph["authorInfo"][i]["paper"][paper]["title"]}
                        //     </div>
                        // )
                    }
                    // author.push(<div className="authorInfo">
                    //     <div className="author">
                    //         <p>{graph["authorInfo"][i]["name"]}</p>
                    //         <p>{"year" in graph["authorInfo"][i] ? graph["authorInfo"][i]["year"] : graph["authorInfo"][i]["yaer"]}</p>
                    //     </div>
                    //     <div className="paper">
                    //         {title}
                    //     </div>

                    // </div>)
                }
                let authorGap=height/(authorNames.length+1);
                let paperGap=height/(titles.length+1);
                let rectHeight=Math.min(authorGap,paperGap);
                let authorLoc:any={};
                let paperLoc:any={};
                authorsEl=authorNames.map((name:string,index:number)=>{
                    authorLoc[name]=[this.padding.left,this.padding.top+(index+1)*authorGap];
                    rects.push(<rect onMouseOut={this.MouseOut} onMouseOver={this.MouseOver.bind(this,name)} key={'rect'+name} x={width*0.15+this.padding.left} y={this.padding.top+(index+1)*authorGap-rectHeight/2} height={rectHeight-2} width={this.rectWidth} fill="#ccc"></rect>)
                    return (
                        <foreignObject key={graph.id+name} width={width*0.15} height={authorGap} x={authorLoc[name][0]} y={authorLoc[name][1]-rectHeight/2}>
                            
                            <div style={{fontSize:"10px",wordBreak:"break-word"}}>{name}</div>
                        
                        </foreignObject>
                    )
                    
                    // <text id={graph.id+name} key={graph.id+name} x={this.padding.left} y={authorLoc[name][1]} fontSize="10px">{name}</text>
                })
                titlesEl=titles.map((name:string,index:number)=>{
                    paperLoc[name]=[this.padding.left+width*0.5,this.padding.top+(index+1)*paperGap];
                    rects.push(<rect onMouseOut={this.MouseOut} onMouseOver={this.MouseOver.bind(this,name)} key={'rect'+name} x={this.padding.left+width*0.5-this.rectWidth} y={this.padding.top+(index+1)*paperGap-rectHeight/2} height={rectHeight-2} width={this.rectWidth} fill="#ccc"></rect>)
                    return <foreignObject key={graph.id+name} width={width*0.4} height={paperGap} x={paperLoc[name][0]} y={paperLoc[name][1]-rectHeight/2}>
                            
                            <div style={{fontSize:"10px",wordBreak:"break-word"}}>{name}</div>
                        
                        </foreignObject>

                    //<text id={graph.id+name} key={graph.id+name} x={paperLoc[name][0]} y={paperLoc[name][1]} fontSize="10px">{name}</text>
                })

                links=linksData.map((value:Array<string>,index:number)=>{
                    // let sourceEl=document.getElementById(graph.id+value[0]) as unknown as HTMLElement;
                    // let targetEl=document.getElementById(graph.id+value[1]) as unknown as HTMLElement;
                    // let point={source:[sourceEl?.clientWidth+(sourceEl?.getAttribute('x') as unknown as number),sourceEl?.clientHeight/2+(sourceEl?.getAttribute('y') as unknown as number)],
                    //             target:[targetEl?.getAttribute('x') as unknown as number,targetEl?.clientHeight/2+(targetEl?.getAttribute('y') as unknown as number)]};
                    // console.log(point)
                    let sourceIndex=authorNames.indexOf(value[0]);
                    let targetIndex=titles.indexOf(value[1]);
                    let point={source:[width*0.15+this.padding.left,this.padding.top+(sourceIndex+1)*authorGap-1],target:[width*0.5+this.padding.left,this.padding.top+(targetIndex+1)*paperGap-1]};
                    return <path key={graph.id+'_'+index} id={'path'+value[0]+'_'+value[1]} d={this.createLink()(point as unknown as any) as unknown as string} stroke={this.color[index%this.color.length]} strokeWidth={rectHeight-2} fill="none" opacity={this.state.focus===""?0.5:(value.indexOf(this.state.focus)<0?0:0.5)}></path>
                })
                
            }
            else if (this.props.dataType === "Family") {
                // el = <TargetTree graph={graph} key={index} />
            }
            else if (this.props.dataType === "Weibo") {
                // el = <TargetTree graph={graph} key={index} />
            }
            // let info = <div id={"authorInfo"+graph.id} style={{ height: '100%', width: '100%', overflowY: "auto", overflowX: "hidden" }}></div>
            return (
                <svg className='infoBox' key={index} style={{ width: "100%", height: '100%', float: 'left', borderBottom: '1px solid #ccc', boxSizing: 'border-box' }}>

                    {/* <div style={{ height: '100%', width: '40%', float: 'left' }}>
                        {el}
                    </div> */}
                    {/* <div style={{ height: '100%', width: '10%', float: 'left', borderLeft: '1px solid #ccc', boxSizing: 'border-box' }}>
                        {info}
                    </div> */}
                    <text x={this.svgWidth-this.padding.right-40} y={this.padding.top+10} fontSize="15px">{graph.year}</text>
                    <g>{authorsEl}</g>
                    <g>{titlesEl}</g>
                    <g className="paths">{links}</g>
                    <g className="s_rects">{rects}</g>
                </svg>
            )
        })

        // let elements=this.state.data.map((value:any,index:number)=>{
        //     if(this.props.dataType==="Author"){
        //         // return <SangJi key={index} graph={value}></SangJi>
        //     }
        // })
        
        return (
            <div id={"authorInfo"} style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                {elements}
            </div>
        )

    }
}
export default Table;