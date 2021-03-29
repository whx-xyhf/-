import * as React from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import {Row,Col,InputNumber,Button} from 'antd';
import NodeList from './NodeList';

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
    showClusterPanel:string,
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
    public color:Array<string>=["#1f78b4","#b2df8a","#33a02c","#fb9a99","#fdbf6f","#ff7f00","#cab2d6","#fddaec","#b3cde3","#984ea3","#ffff33","#a65628","#f781bf","#999999","#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#a6cee3"];
    public lightColor:string='orange';
    public centerColor:string='red';
    public otherColor:Array<string>=['#ccc','black'];
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
        this.setMinSamples=this.setMinSamples.bind(this);
        this.setKm=this.setKm.bind(this);
        this.reDbscan=this.reDbscan.bind(this);
        this.reKMeans=this.reKMeans.bind(this);
        this.cannel=this.cannel.bind(this);
        this.state={
            data:[],
            choosePoints:[],
            centerPoint:{},
            eps:null,
            minSamples:null,
            km:null,
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
            if(value.id===1455){
                this.setState({centerPoint:value})
            }
        })
        this.setState({data:data});
    }
    getPointsData(url:string,dataType:string,width:number,height:number,dimensions:number,strWeight:number,attrWeight:number,attrChecked:Array<any>):void{
        axios.post(url,{dataType:dataType,dimensions:dimensions,strWeight:strWeight,attrWeight:attrWeight,attrChecked:attrChecked}).then(res=>{
            this.compute(res.data.data,width,height);
            // this.setState({eps:res.data.eps,minSamples:res.data.minSamples});
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
        if(cluster===-2){
            const {data}=this.state;
            data.forEach((value:any)=>{
                value.opacity=1;
            })
            this.setState({data:data});
        }
        else{
            new Promise((resolve)=>{
                let data=JSON.parse(JSON.stringify(this.state.data));
                let chooseData:any=[];
                data.forEach((value:any)=>{
                    if(value.cluster===cluster)
                        chooseData.push(value);
                        
                    value.opacity=0.1;
                    
                })
                let centerx=0,centery=0;
                for(let i in chooseData){
                    centerx+=chooseData[i].x;
                    centery+=chooseData[i].y;
                }
                centerx/=chooseData.length;
                centery/=chooseData.length;
    
                for(let i in chooseData){
                    chooseData[i].distance=Math.pow(chooseData[i].x-centerx,2)+Math.pow(chooseData[i].y-centery,2);
                }
                resolve(chooseData);
            })
            .then((res:any)=>{
                res.sort((a:any,b:any)=>a.distance-b.distance);
                this.props.parent.setChoosePoints(res);
                this.props.parent.setPersonGraphs([res[0]]);
                this.setState({centerPoint:res[0]})
            })
           
        }
        
    }
    setEps(value:any):void{
        this.setState({eps:value});
    }
    setMinSamples(value:any):void{
        this.setState({minSamples:value});
    }
    setKm(value:any){
        this.setState({km:value});
    }
    reDbscan():void{
        const {url,dimensions,attrWeight,strWeight,attrChecked,dataType}=this.props;
        const {eps,minSamples}=this.state;
        let model="";
        if(this.props.reTsneData.length>0)
            model="model";

        let checkedArr:any=[];
        for(let key in attrChecked){
            checkedArr.push({name:key,value:attrChecked[key]});
        }
        axios.post(url+'/reCluster',{dataType:dataType,dimensions:dimensions,attrWeight:attrWeight,strWeight:strWeight,attrChecked:checkedArr,eps:eps,minSamples:minSamples,algorithm:'dbscan',model:model})
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
    reKMeans():void{
        const {url,dimensions,attrWeight,strWeight,attrChecked,dataType}=this.props;
        const {km}=this.state;
        let model="";
        if(this.props.reTsneData.length>0)
            model="model";
        let checkedArr:any=[];
        for(let key in attrChecked){
            checkedArr.push({name:key,value:attrChecked[key]});
        }
        axios.post(url+'/reCluster',{dataType:dataType,dimensions:dimensions,attrWeight:attrWeight,strWeight:strWeight,attrChecked:checkedArr,km:km,algorithm:'kmeans',model:model})
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
    cannel():void{
        this.props.parent.setShowClusterPanel('none');
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
        const {data,choosePoints,eps,minSamples,km}=this.state;
        const {dataType,attrChecked,attrWeight,strWeight,url,dimensions}=this.props;
        //所有点
        let points=[];
        let useColor:Array<number>=[];
        let noise=false;
        for(let i=0;i<data.length;i++){
            if(data[i].cluster!==-1&& data[i].cluster!==-2 && useColor.indexOf(data[i].cluster)<0)
                useColor.push(data[i].cluster);
            else if(data[i].cluster===-1)
                noise=true;
            points.push(
                <circle r="2px" cx={data[i].x} cy={data[i].y} key={data[i].id} fill={data[i].cluster<0?this.otherColor[2+data[i].cluster]:this.color[data[i].cluster]} 
                 onClick={this.searchGraph.bind(this,data[i])} opacity={data[i].opacity}></circle>
            )
        }
        //圈选的点，匹配到的点
        let pointsChoose=choosePoints.map((value:ChoosePointData,index:number)=>
            <circle r="2px" opacity={1} cx={value.x} cy={value.y} key={index} fill={value.cluster<0?this.otherColor[2+value.cluster]:this.color[value.cluster]} onClick={this.searchGraph.bind(this,value)}></circle>
        )
        //点击的点，需要匹配的点
        let centerPoint=null;
        if(JSON.stringify(this.state.centerPoint)!=='{}'){
            centerPoint=<circle r="3.5px" cx={this.state.centerPoint.x} cy={this.state.centerPoint.y} fill={this.centerColor} onClick={this.searchGraph.bind(this,this.state.centerPoint)}></circle>
        }

        let colorRect:Array<React.ReactElement>=[];
        for(let i=0;i<useColor.length;i++){
            colorRect.push(<rect key={i} onClick={this.getClusterNodes.bind(this,i)} x={this.svgWidth-(useColor.length-i)*10-10} y={this.svgHeight-12} height={10} width={10} fill={this.color[i]}></rect>)
        }
        let clustersText=null;
        let allClustersText=null;
        let allClustersRect=null;
        let noiseText=null;
        let noiseRect=null;
        if(useColor.length>0){
            clustersText=<text fontSize="10px" x={this.svgWidth-(useColor.length*10)-55} y={this.svgHeight-3}>Clusters:</text>
            allClustersRect=<rect onClick={this.getClusterNodes.bind(this,-2)} x={this.svgWidth-useColor.length*10-75} y={this.svgHeight-12} height={10} width={10} fill={this.otherColor[0]}></rect>
            allClustersText=<text fontSize="10px" x={this.svgWidth-(useColor.length*10)-95} y={this.svgHeight-3}>All:</text>
        }
        if(noise){
            noiseRect=<rect onClick={this.getClusterNodes.bind(this,-1)} x={this.svgWidth-useColor.length*10-115} y={this.svgHeight-12} height={10} width={10} fill={this.otherColor[1]}></rect>
            noiseText=<text fontSize="10px" x={this.svgWidth-(useColor.length*10)-150} y={this.svgHeight-3}>Noise:</text>
        }
        return(
            <div className="scatter">
                <svg style={{width:'100%',height:'100%'}} ref={this.svgRef} id="svg_scatter">
                    <g>{points}</g>
                    <g>{pointsChoose}</g>
                    <g>{centerPoint}</g>
                    {colorRect}
                    {clustersText}
                    {allClustersRect}
                    {allClustersText}
                    {noiseRect}
                    {noiseText}
                </svg>
                {/* <canvas ref={this.canvasRef} style={{position:'absolute',top:'0',left:'0'}}
                onMouseMove={this.onMouseMove} onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp}></canvas> */}
                {/* <div style={{position:'absolute',width:'160px',height:'100px',right:this.padding.right,top:5,border:'1px solid #ccc',fontSize:'0.5rem',padding:'5px 5px',}}>
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
                </div> */}
                <div className="clusterPanel" style={{display:this.props.showClusterPanel}}>
                    <Row style={{ height: '50px',margin:'10px 10px',fontSize:'1rem' }}>DBSCAN Paramenter:</Row>
                    <Row style={{ height: '50px',margin:'10px 10px' }}>
                    <Col span={5}>Eps:</Col>
                    <Col span={5}>
                        <InputNumber
                        min={1}
                        max={20}
                        size='small'
                        style={{ margin: '0 5px', width: '100%' }}
                        value={eps}
                        onChange={this.setEps}
                        />
                    </Col>
                    <Col span={1}></Col>
                    <Col span={5}>Min_samples:</Col>
                    <Col span={5}>
                        <InputNumber
                        min={1}
                        max={20}
                        size='small'
                        style={{ margin: '0 5px', width: '100%' }}
                        value={minSamples}
                        onChange={this.setMinSamples}
                        />
                    </Col>
                    <Col span={1}></Col>
                    </Row>

                    <Row style={{ height: '50px',margin:'10px 10px' ,fontSize:'1rem'}}>K-Means Paramenter:</Row>
                    <Row style={{ height: '50px',margin:'0 10px' }}>
                    <Col span={5}>N_cluster:</Col>
                    <Col span={5}>
                        <InputNumber
                        min={1}
                        max={20}
                        size='small'
                        style={{ margin: '0 5px', width: '100%' }}
                        value={km}
                        onChange={this.setKm}
                        />
                    </Col>
                    <Col span={9}></Col>
                    </Row>
                    <Row>
                    <Col span={8}><Button style={{ margin: '5px 5px'}} size='large' onClick={this.reDbscan}>Run Dbscan</Button></Col>
                    <Col span={8}><Button style={{ margin: '5px 5px'}} size='large' onClick={this.reKMeans}>Run KMeans</Button></Col>
                    <Col span={8}><Button style={{ margin: '5px 5px'}} size='large' onClick={this.cannel}>Cancel</Button></Col>
                    </Row>
                    <Row>
                        <NodeList dimensions={dimensions} url={url} dataType={dataType} attrChecked={attrChecked} attrWeight={attrWeight} strWeight={strWeight} parent={this.props.parent.setPersonGraphs}></NodeList>
                    </Row>
                </div>
            </div>
        )
    }
}
export default Scatter