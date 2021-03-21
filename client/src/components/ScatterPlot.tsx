import * as React from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import {Row,Col,InputNumber,Button} from 'antd';

interface Props{
    reTsneData:Array<PointData>,
    url:string,
    choosePoints:Array<ChoosePointData>,//匹配的数据
    centerPoint:ChoosePointData,
    parent:any,
    dimensions:number,
    strWeight:number,
    attrWeight:number,
    attrChecked:attr,
    attrValue:attr,
    dataType:string,
}
//定义边数组
type edges=Array<number>;
//定义散点数据接口
interface PointData {
    id: number,
    // nodes: Array<number>,
    // edges:Array<edges>,
    x:number,
    y:number,
    [propName: string]: any,
}
type ChoosePointData ={
    id: number,
    // nodes: Array<number>,
    // edges:Array<edges>,
    [propName:string]:any,
}
//圈选数据接口
interface PathData{
    pathPoints:Array<edges>,
    dashArray:Array<number>,
    noDash:Array<number>,
    isFill:string,
    drawFlag:boolean,
}
type attr={
    [propName: string]: any,
  }

class Scatter extends React.Component<Props,any>{
    private svgRef:React.RefObject<SVGSVGElement>;
    private canvasRef:React.RefObject<HTMLCanvasElement>;
    public svgWidth:number=0;
    public svgHeight:number=0;
    public padding={top:10,bottom:20,left:10,right:10};
    public ctx:CanvasRenderingContext2D | null=null;
    public color:Array<string>=["#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#fddaec","#b3cde3","#4daf4a","#984ea3","#ffff33","#a65628","#f781bf","#999999","#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#a6cee3"];
    public lightColor:string='orange';
    public centerColor:string='red';
    public path:PathData={
        pathPoints:[],
        dashArray:[7,7],
        noDash:[0,0],
        isFill:'none',
        drawFlag:false,
    }
    constructor(props:Props){
        super(props);
        this.svgRef=React.createRef();
        this.canvasRef=React.createRef();
        this.getPointsData=this.getPointsData.bind(this);
        this.onMouseDown=this.onMouseDown.bind(this);
        this.onMouseMove=this.onMouseMove.bind(this);
        this.onMouseUp=this.onMouseUp.bind(this);
        this.compute=this.compute.bind(this);
        this.getClusterNodes=this.getClusterNodes.bind(this);
        this.setEps=this.setEps.bind(this);
        this.setMinSample=this.setMinSample.bind(this);
        this.reDbscan=this.reDbscan.bind(this);
        this.state={
            data:[],
            choosePoints:[],
            centerPoint:{},
            eps:null,
            minSamples:null,
        };
        

    }
    //请求散点数据并做比例尺映射
    compute(data:any,width:number,height:number){
        let x_max:number=d3.max(data,(d:PointData):number=>d.x) || 0;
        let x_min:number=d3.min(data,(d:PointData):number=>d.x) || 0;
        let y_max:number=d3.max(data,(d:PointData):number=>d.y) || 0;
        let y_min:number=d3.min(data,(d:PointData):number=>d.y) || 0;
        let xScale: d3.ScaleLinear<number, number>=d3.scaleLinear().domain([x_min,x_max]).range([this.padding.left,width-this.padding.right]);
        let yScale: d3.ScaleLinear<number, number>=d3.scaleLinear().domain([y_min,y_max]).range([this.padding.top,height-this.padding.bottom]);
        
        data.forEach((value:PointData)=>{
            value.x=xScale(value.x);
            value.y=yScale(value.y);
            value.opacity=1;
        })
        this.setState({data:data});
    }
    getPointsData(url:string,dataType:string,width:number,height:number,dimensions:number,strWeight:number,attrWeight:number,attrChecked:Array<any>):void{
        axios.post(url,{dataType:dataType,dimensions:dimensions,strWeight:strWeight,attrWeight:attrWeight,attrChecked:attrChecked}).then(res=>{
            this.compute(res.data.data,width,height);
            this.setState({eps:res.data.eps,minSamples:res.data.minSamples});
            // let x_max:number=d3.max(res.data.data,(d:PointData):number=>d.x) || 0;
            // let x_min:number=d3.min(res.data.data,(d:PointData):number=>d.x) || 0;
            // let y_max:number=d3.max(res.data.data,(d:PointData):number=>d.y) || 0;
            // let y_min:number=d3.min(res.data.data,(d:PointData):number=>d.y) || 0;
            // let xScale: d3.ScaleLinear<number, number>=d3.scaleLinear().domain([x_min,x_max]).range([this.padding.left,width-this.padding.right]);
            // let yScale: d3.ScaleLinear<number, number>=d3.scaleLinear().domain([y_min,y_max]).range([this.padding.top,height-this.padding.bottom]);
            
            // res.data.data.forEach((value:PointData)=>{
            //     value.x=xScale(value.x);
            //     value.y=yScale(value.y);
            //     value.opacity=1;
            // })
            
            // this.setState({data:res.data.data});
        })
    }
    setEps(value:any):void{
        this.setState({eps:value});
    }
    setMinSample(value:any):void{
        this.setState({minSamples:value});
    }
    onMouseDown(event:React.MouseEvent<HTMLCanvasElement, MouseEvent>):void{
        let path=this.path;
        path.isFill='none';
        path.pathPoints=[];
        if(this.canvasRef.current && this.ctx){
            this.ctx.clearRect(0,0,this.svgWidth,this.svgHeight);
            let x=event.nativeEvent.offsetX;
            let y=event.nativeEvent.offsetY;
            path.pathPoints.push([x,y]);
            this.ctx.setLineDash(path.dashArray);
        }
        path.drawFlag=true;
    }
    onMouseMove(event:React.MouseEvent<HTMLCanvasElement, MouseEvent>):void{

        let path=this.path;
        if(path.drawFlag && this.ctx && this.canvasRef.current){
            this.ctx.clearRect(0,0,this.svgWidth,this.svgHeight);
            let x=event.nativeEvent.offsetX;
            let y=event.nativeEvent.offsetY;
            this.ctx.beginPath();
            this.ctx.moveTo(path.pathPoints[0][0],path.pathPoints[0][1]);
            path.pathPoints.push([x,y]);
            for(let i=1;i<path.pathPoints.length;i++){
                this.ctx.lineTo(path.pathPoints[i][0], path.pathPoints[i][1]);
            }
            this.ctx.lineTo(path.pathPoints[0][0],path.pathPoints[0][1]);
            this.ctx.stroke();
            this.ctx.fill();
        }
    }
    onMouseUp(event:React.MouseEvent<HTMLCanvasElement, MouseEvent>):void{
        let path=this.path;
        if(path.drawFlag && this.ctx && this.canvasRef.current){
            this.ctx.clearRect(0,0,this.svgWidth,this.svgHeight);
            this.ctx.beginPath();
            this.ctx.setLineDash(path.noDash);
            this.ctx.moveTo(path.pathPoints[0][0],path.pathPoints[0][1]);
            for(let i=1;i<path.pathPoints.length;i++){
                this.ctx.lineTo(path.pathPoints[i][0], path.pathPoints[i][1]);
            }
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
        }
            
        path.drawFlag=false;
        path.isFill="none";

        //获取全选的子图对应的数据
        let data=this.state.data;
        let choosePoints=[];
        for(let i=0;i<data.length;i++){
            if(this.isInPolygon([data[i].x,data[i].y],this.path.pathPoints)){
                choosePoints.push({
                    id:data[i].id,
                    nodes:data[i].nodes,
                    edges:data[i].edges,
                    x:data[i].x,
                    y:data[i].y,
                })
            }
        }
        this.setState({choosePoints:choosePoints});
        this.props.parent.setChoosePoints(choosePoints);
        
    }
    componentDidMount():void{
        this.svgWidth=this.svgRef.current?.clientWidth || 0;
        this.svgHeight=this.svgRef.current?.clientHeight || 0;
        // this.getPointsData(this.props.url,this.svgWidth,this.svgHeight,this.props.dimensions,this.props.strWeight,this.props.attrWeight);
        let canvas = this.canvasRef.current;
        if(canvas){
            canvas.width=this.svgWidth;
            canvas.height=this.svgHeight;
            this.ctx=canvas.getContext('2d');
            if(this.ctx){
                // 设置线条颜色
                this.ctx.strokeStyle = '#000';
                this.ctx.fillStyle="rgba(204,204,204,0.5)";
                this.ctx.lineWidth = 1;
                this.ctx.lineJoin = 'round';
                this.ctx.lineCap = 'round';   
            }
            
        }
        let svg=d3.select('#svg_scatter')
        svg.call(d3.zoom()
        .scaleExtent([0.1,7])
        .on("zoom",zoomed));
        
        function zoomed(){
            let transform = d3.zoomTransform(svg.node());
            //svg_point.selectAll("circle").attr("r",1);
            svg.selectAll("g").attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
        }
    }
    isInPolygon(checkPoint:Array<number>, polygonPoints:Array<edges>) {//判断一个点是否在多边形内
        var counter = 0;
        var i;
        var xinters;
        var p1, p2;
        var pointCount = polygonPoints.length;
        p1 = polygonPoints[0];
    
        for (i = 1; i <= pointCount; i++) {
            p2 = polygonPoints[i % pointCount];
            if (
                checkPoint[0] > Math.min(p1[0], p2[0]) &&
                checkPoint[0] <= Math.max(p1[0], p2[0])
            ) {
                if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
                    if (p1[0] !== p2[0]) {
                        xinters =
                            (checkPoint[0] - p1[0]) *
                                (p2[1] - p1[1]) /
                                (p2[0] - p1[0]) +
                            p1[1];
                        if (p1[1] === p2[1] || checkPoint[1] <= xinters) {
                            counter++;
                        }
                    }
                }
            }
            p1 = p2;
        }
        if (counter % 2 === 0) {
            return false;
        } else {
            return true;
        }
    }
    searchGraph(pointData:ChoosePointData):void{//根据名字搜索包含该节点的网络
        const {url,dimensions,attrWeight,strWeight,attrChecked,dataType}=this.props;
        let checkedArr:any=[];
        for(let key in attrChecked){
            checkedArr.push({name:key,value:attrChecked[key]})
        }
        axios.post(url+'/searchGraphByGraphId',{wd:pointData.id,dataType:dataType,dimensions:dimensions,attrWeight:attrWeight,strWeight:strWeight,attrChecked:checkedArr})
        .then(res=>{
            // console.log(res.data.data);
            this.props.parent.setPersonGraphs(res.data.data);
        })
        this.setState({centerPoint:pointData});
    }
    getClusterNodes(cluster:number):void{
        const {url,dimensions,attrWeight,strWeight,attrChecked,dataType}=this.props;
        let checkedArr:any=[];
        for(let key in attrChecked){
            checkedArr.push({name:key,value:attrChecked[key]})
        }
        axios.post(url+'/getCluster',{cluster:cluster,dataType:dataType,dimensions:dimensions,attrWeight:attrWeight,strWeight:strWeight,attrChecked:checkedArr})
        .then(res=>{
            let ids=res.data.data;
            let chooseData:any=[];
            for(let i=0;i<ids.length;i++){
                for(let j=0;j<this.state.data.length;j++){
                    if(this.state.data[j]['id']===Number(ids[i])){
                        chooseData.push(this.state.data[j]);
                        break;
                    }
                }
            }
            this.state.data.forEach((value:any)=>{
                if(value.opacity===1)
                    value.opacity=0.1;
            })
            // this.setState({choosePoints:chooseData});
            this.props.parent.setChoosePoints(chooseData);

        })
    }
    reDbscan():void{
        const {url,dimensions,attrWeight,strWeight,attrChecked,dataType}=this.props;
        const {eps,minSamples}=this.state;
        let checkedArr:any=[];
        for(let key in attrChecked){
            checkedArr.push({name:key,value:attrChecked[key]})
        }
        axios.post(url+'/reDbscan',{dataType:dataType,dimensions:dimensions,attrWeight:attrWeight,strWeight:strWeight,attrChecked:checkedArr,eps:eps,minSamples:minSamples})
        .then(res=>{
            const {data,choosePoints}=this.state;
            let newCluterData=res.data.data;
            for(let i in data){
                data[i]['cluster']=newCluterData[Number(data[i]['id'])]['cluster'];
            }
            for(let i in choosePoints){
                choosePoints[i]['cluster']=newCluterData[Number(choosePoints[i]['id'])]['cluster'];
            }
            this.setState({data:data,choosePoints:choosePoints});
        })
    }
    componentWillReceiveProps(nextProps:Props):void{
        if(nextProps.choosePoints!==this.props.choosePoints){
            let choosePoints=[];
            for(let j in nextProps.choosePoints){
                for(let i in this.state.data){
                    if(this.state.data[i].id===nextProps.choosePoints[j].id){
                        choosePoints.push(this.state.data[i]);
                        break;
                    }
                }
            }
            this.state.data.forEach((value:any)=>{
                if(value.opacity===1)
                    value.opacity=0.1;
            })
            this.setState({choosePoints:choosePoints});
        }
        if(JSON.stringify(nextProps.centerPoint)!==JSON.stringify(this.props.centerPoint)){
            for(let i in this.state.data){
                if(this.state.data[i].id===nextProps.centerPoint.id){
                    this.setState({centerPoint:this.state.data[i]});
                    break;
                }
            }
        }
        
        if(nextProps.dimensions!==this.props.dimensions || nextProps.attrChecked!==this.props.attrChecked){
            // console.log(111)
            let checkedArr:any=[];
            for(let key in nextProps.attrChecked){
                checkedArr.push({name:key,value:nextProps.attrChecked[key]})
            }
            if(checkedArr.length>0)
                this.getPointsData(nextProps.url,nextProps.dataType,this.svgWidth,this.svgHeight,nextProps.dimensions,nextProps.strWeight,nextProps.attrWeight,checkedArr);
            this.setState({centerPoint:{}})
        }
        
        if(JSON.stringify(nextProps.attrValue)!==JSON.stringify(this.props.attrValue) && JSON.stringify(nextProps.centerPoint)!=='{}' && JSON.stringify(nextProps.centerPoint)!==JSON.stringify(this.props.centerPoint)){
            // console.log(nextProps.dataType===this.props.dataType)
            // console.log(nextProps.attrValue)
            let checkedArr:any=[];
            for(let key in nextProps.attrChecked){
                if(nextProps.attrChecked[key]===true)
                    checkedArr.push({name:key,value:true})
            }
            const data=JSON.parse(JSON.stringify(this.state.data));
            const {attrValue}=nextProps;
            data.forEach((value:PointData)=>{
                for(let i in checkedArr){
                    let attr=value.attr[checkedArr[i].name];
                    if(attr<attrValue[checkedArr[i].name][0] || attr>attrValue[checkedArr[i].name][1]){
                        value.opacity=0;
                        return ;
                    }
                }
                value.opacity=1
            })
            this.setState({data:data});
        }
        if(nextProps.reTsneData!==this.props.reTsneData){
            console.log('yes');
            this.compute(nextProps.reTsneData,this.svgWidth,this.svgHeight)
        }
        
    }
    render():React.ReactElement{
        let data=this.state.data;
        //所有点
        let points=[];
        let useColor:Array<number>=[];
        for(let i=0;i<data.length;i++){
            if(data[i].cluster!==-1&&useColor.indexOf(data[i].cluster)<0)
            useColor.push(data[i].cluster);
            points.push(
                <circle r="2px" cx={data[i].x} cy={data[i].y} key={data[i].id} fill={data[i].cluster===-1?'black':this.color[data[i].cluster]} 
                 onClick={this.searchGraph.bind(this,data[i])} opacity={data[i].opacity}></circle>
            )
        }
        //圈选的点，匹配到的点
        let pointsChoose=this.state.choosePoints.map((value:ChoosePointData,index:number)=>
            <circle r="2px" opacity={1} cx={value.x} cy={value.y} key={index} fill={this.color[value.cluster]} onClick={this.searchGraph.bind(this,value)}></circle>
        )
        //点击的点，需要匹配的点
        let centerPoint=null;
        if(JSON.stringify(this.state.centerPoint)!=='{}'){
            console.log(this.state.centerPoint)
            centerPoint=<circle r="3.5px" cx={this.state.centerPoint.x} cy={this.state.centerPoint.y} fill={this.centerColor} onClick={this.searchGraph.bind(this,this.state.centerPoint)}></circle>
        }

        let colorRect:Array<React.ReactElement>=[];
        for(let i=0;i<useColor.length;i++){
            colorRect.push(<rect key={i} onClick={this.getClusterNodes.bind(this,i)} x={this.padding.left+10*i} y={this.svgHeight-this.padding.bottom+10} height={10} width={10} fill={this.color[i]}></rect>)
        }
        return(
            <div className="scatter">
                <svg style={{width:'100%',height:'100%'}} ref={this.svgRef} id="svg_scatter">
                    <g>{points}</g>
                    <g>{pointsChoose}</g>
                    <g>{centerPoint}</g>
                    {colorRect}
                </svg>
                {/* <canvas ref={this.canvasRef} style={{position:'absolute',top:'0',left:'0'}}
                onMouseMove={this.onMouseMove} onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp}></canvas> */}
                <div style={{position:'absolute',width:'160px',height:'100px',right:this.padding.right,top:5,border:'1px solid #ccc',fontSize:'0.5rem',padding:'5px 5px',}}>
                    <Row style={{height:'30px'}}>
                        <Col span={8}>EPS:</Col>
                        <Col span={14}>
                            <InputNumber value={this.state.eps} style={{margin:'0',width:'100%'}} size='small' onChange={this.setEps}></InputNumber>
                        </Col>
                        
                    </Row>
                    <Row style={{height:'30px'}}>
                        <Col span={8}>MS：</Col>
                        <Col span={14}>
                            <InputNumber value={this.state.minSamples} style={{margin:'0',width:'100%'}} size='small' onChange={this.setMinSample}></InputNumber>
                        </Col>
                    </Row>
                    <Row style={{height:'30px'}}>
                        <Col span={20}><Button style={{ margin: '0 10%' ,width:'100%'}} size='small' onClick={this.reDbscan}>Apply</Button></Col>
                    </Row>
                </div>
            </div>
        )
    }
}
export default Scatter