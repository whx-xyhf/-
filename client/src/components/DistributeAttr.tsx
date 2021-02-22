import * as React from 'react';
import axios from 'axios';
import * as d3 from 'd3';

type attr = {
    [propName: string]: any,
}

interface Props {
    url: string,
    parent: any,
    dimensions: number,
    attrWeight:number,
    strWeight:number,
    attrChecked:attr,
    choosePoints:Array<ChoosePointData>,//匹配的数据
    centerPoint:ChoosePointData,
    display:string,
}
//定义边数组
type edges=Array<number>;
//定义散点数据接口
type ChoosePointData ={
    id: number,
    nodes: Array<number>,
    edges:Array<edges>,
    [propName:string]:any,
}
class DistributeAttr extends React.Component<Props, any>{

    private svgRef: React.RefObject<SVGSVGElement>;
    public padding={top:30,bottom:50,left:50,right:30};
    public svgWidth: number = 0;
    public svgHeight: number = 0;
    public lightColor:string='orange';
    public centerColor:string='red';
    constructor(props:Props){
        super(props);
        this.state={data:[],attrList:[],xAttr:'',yAttr:'',choosePoints:[],centerPoint:null};
        this.svgRef = React.createRef();
        this.compute=this.compute.bind(this);
        this.selectXAttr=this.selectXAttr.bind(this);
        this.selectYAttr=this.selectYAttr.bind(this);
        this.searchGraph=this.searchGraph.bind(this);
    }

    compute(data:any,xAttr:string,yAttr:string):void{
        let x_min_max=d3.extent(data, (d:any) => d.attr[xAttr]);
        // x_min_max[0]=0;
        let y_min_max=d3.extent(data, (d:any) => d.attr[yAttr]);
        // y_min_max[0]=0;
        let xscale=d3.scaleLinear(x_min_max,[this.padding.left,this.svgWidth-this.padding.right]);
        let yscale=d3.scaleLinear(y_min_max,[this.svgHeight-this.padding.bottom,this.padding.top]);
        data.forEach((value:any) => {
            value.x=xscale(value.attr[xAttr]);
            value.y=yscale(value.attr[yAttr]);
        });
        
        d3.select("#svg_disAttr")
        .select(".axis")
        .selectAll("g")
        .remove();
        d3.select("#svg_disAttr")
        .select(".text")
        .selectAll("g")
        .remove();

        d3.select("#svg_disAttr")
        .select(".axis")
        .append("g")
        .attr("transform", `translate(-2,${this.svgHeight-this.padding.bottom+2})`)
        .call(d3.axisBottom(xscale).ticks(8))
        d3.select("#svg_disAttr")
        .select(".axis")
        .append("g")
        .attr("transform", `translate(${this.padding.left-2},2)`)
        .call(d3.axisLeft(yscale).ticks(5))
        
        this.setState({data:data});
    }
    //改变x轴属性
    selectXAttr(e:React.ChangeEvent<HTMLSelectElement>):void{
        let xAttr=e.target.value;
        const {data,yAttr}=this.state;
        this.compute(data,xAttr,yAttr);
        this.setState({xAttr:xAttr});
    }
    //改变y轴属性
    selectYAttr(e:React.ChangeEvent<HTMLSelectElement>):void{
        let yAttr=e.target.value;
        const {data,xAttr}=this.state;
        this.compute(data,xAttr,yAttr);
        this.setState({yAttr:yAttr});
    }
    searchGraph(pointData:ChoosePointData):void{//根据名字搜索包含该节点的网络
        const {url,dimensions,attrWeight,strWeight,attrChecked}=this.props;
        let checkedArr:any=[];
        for(let key in attrChecked){
            checkedArr.push({name:key,value:attrChecked[key]})
        }
        axios.post(url+'/searchGraphByGraphId',{wd:pointData.id,dimensions:dimensions,attrWeight:attrWeight,strWeight:strWeight,attrChecked:checkedArr})
        .then(res=>{
            // console.log(res.data.data);
            this.props.parent.setPersonGraphs(res.data.data);
        })
        this.setState({centerPoint:pointData});
    }

    componentDidMount():void{
        this.svgWidth = this.svgRef.current?.clientWidth || 0;
        this.svgHeight = this.svgRef.current?.clientHeight || 0;
        
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
            this.setState({choosePoints:choosePoints});
        }
        if(nextProps.centerPoint!==this.props.centerPoint){
            for(let i in this.state.data){
                if(this.state.data[i].id===nextProps.centerPoint.id){
                    this.setState({centerPoint:this.state.data[i]});
                    break;
                }
            }
        }
        if(nextProps.attrChecked!==this.props.attrChecked){
            const {url,dimensions,attrWeight,strWeight,attrChecked}=nextProps;
            let checkedArr:any=[];
            for(let key in attrChecked){
                checkedArr.push({name:key,value:attrChecked[key]})
            }
            axios.post(url,{dimensions:dimensions,attrWeight:attrWeight,strWeight:strWeight,attrChecked:checkedArr})
            .then(res=>{
                const data=res.data.data;
                let {xAttr,yAttr,attrList} = this.state;
                attrList=[];
                for(let i in data[0].attr){
                    attrList.push(i);
                }
                xAttr=attrList[0];
                yAttr=attrList[1];
                this.setState({xAttr:xAttr,yAttr:yAttr,attrList:attrList});
                this.compute(data,xAttr,yAttr);
            })
        }
    }


    render():React.ReactElement{
        const {data,attrList,xAttr,yAttr,centerPoint,choosePoints}=this.state;
        let allPointEl=data.map((value:any,index:number)=>
            <circle key={index} cx={value.x} cy={value.y} r='2px' fill='#1890ff' fillOpacity={0.4} stroke='white' strokeWidth='0.5px'
            onClick={this.searchGraph.bind(this,value)}></circle>
        )
        let xselect=attrList.map((value:string,index:number)=>
            <option value={value} key={index} selected={xAttr===value?true:false}>{value}</option>
        )
        let yselect=attrList.map((value:string,index:number)=>
            <option value={value} key={index} selected={yAttr===value?true:false}>{value}</option>
        )
        //centerPoint
        //点击的点，需要匹配的点
        let centerPointEl=null;
        if(centerPoint!=null){
            centerPointEl=<circle r="2px" cx={centerPoint.x} cy={centerPoint.y} fill={this.centerColor} stroke='white' strokeWidth='0.5px' 
            onClick={this.searchGraph.bind(this,centerPoint)}></circle>
        }
        //圈选的点，匹配到的点
        let pointsChooseEl=choosePoints.map((value:ChoosePointData,index:number)=>
            <circle r="2px" cx={value.x} cy={value.y} key={index} fill={this.lightColor} stroke='white' strokeWidth='0.5px'
             onClick={this.searchGraph.bind(this,value)}></circle>
        )
        
        return (
            <div className="distributeAttr" style={{position:'absolute',left:this.props.display==='0'?'-100%':'0'}}>
                <select style={{position:'absolute',top:0,left:0}} onChange={this.selectYAttr}>
                    {yselect}
                </select>
                <select style={{position:'absolute',bottom:0,right:0}} onChange={this.selectXAttr}>
                    {xselect}
                </select>
                <svg style={{width:'100%',height:'100%'}} ref={this.svgRef} id='svg_disAttr'>
                    {allPointEl}
                    {pointsChooseEl}
                    {centerPointEl}
                    <g className="axis"></g>
                    <g className="text"></g>
                </svg>
            </div>
        )
    }
}
export default DistributeAttr;