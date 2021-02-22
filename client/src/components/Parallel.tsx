import * as React from 'react';
import axios from 'axios';
import * as d3 from 'd3';


interface Props{
    reTsneData:any,
    url:string,
    centerPoint:any,
    choosePoints:any,
    attrWeight:number,
    parent:any,
    attrValue:attr,
    attrChecked:attr,
}
type attr={
    [propName: string]: any,
  }

class Parallel extends React.Component<Props,any>{
    private svgRef:React.RefObject<SVGSVGElement>;
    public svgWidth:number=0;
    public svgHeight:number=0;
    public padding={top:10,bottom:30,left:30,right:50};
    public pathStroke:string='#99CCFF';
    public pathStrokeChoose:string='orange';
    public pathStrokeCenter:string='red';
    constructor(props:Props){
        super(props);
        this.svgRef=React.createRef();
        this.state={data:[]};
        this.getAttrData=this.getAttrData.bind(this);
        this.compute=this.compute.bind(this);
    }
    compute(data:any):void{
        let attr_name:Array<string>=[];
        for(let key in data[0].attr){
            attr_name.push(key);
        }
        //x方向比例尺
        let xscale=d3.scalePoint(attr_name,[this.padding.left,this.svgWidth-this.padding.right]);
        //y方向比例尺
        let min_max:any=new Map(Array.from(attr_name, key => [key,d3.extent(data, (d:any) => d.attr[key])]));
        let attr:attr={};
        let checked:attr={};
        attr_name.forEach((value:string,index:number)=>{
            checked[value]=true;
            attr[value]=min_max.get(value);
        })
        this.props.parent.setAttr(attr);
        this.props.parent.initAttrChecked(checked);
        let yscale:any = new Map(Array.from(attr_name, key => [key, d3.scaleLinear(min_max.get(key), [this.svgHeight-this.padding.bottom, this.padding.top])]));
        for(let i in data){
            let pathData=[];
            for(let j in data[i].attr){
                pathData.push([xscale(j),yscale.get(j)(data[i].attr[j])])
            }
            data[i].pathData=pathData;
        }
        d3.select("#svg_parallel")
            .select(".axis")
            .selectAll("g")
            .remove()
        d3.select("#svg_parallel")
            .select(".text")
            .selectAll("g")
            .remove()
        for(let i=0;i<attr_name.length;i++){
            d3.select("#svg_parallel")
            .select(".axis")
            .append("g")
            .attr("transform", `translate(${xscale(attr_name[i])},0)`)
            .call(d3.axisRight(yscale.get(attr_name[i])).ticks(5))
            d3.select("#svg_parallel")
            .select(".text")
            .append("g")
            .append('text')
            .attr("x", -6)
            .attr("y", -6)
            .attr("text-anchor", "start")
            .attr("fill", "black")
            .text(attr_name[i])
            .attr('font-size',12)
            .attr("transform", `translate(${xscale(attr_name[i])},${this.svgHeight})`)
        }
       
        this.setState({data:data});
    }
    getAttrData():void{
        axios.post(this.props.url)
        .then(res=>{
            this.compute(res.data.data);
        })
    }
    componentDidMount():void{
        this.svgWidth=this.svgRef.current?.clientWidth || 0;
        this.svgHeight=this.svgRef.current?.clientHeight || 0;
        this.getAttrData();
    }
    line(data:[[number,number]]):string{//生成路径
        let d='';
        for(let i=0;i<data.length;i++){
            if(i===0)
                d+=`M${data[i][0]} ${data[i][1]} `;
            else
                d+=`L${data[i][0]} ${data[i][1]} `;
        }
        return d;
    }
    componentWillReceiveProps(nextProps:Props){
        if(nextProps.attrValue!==this.props.attrValue && nextProps.attrWeight!==0){
            let checkedArr:any=[];
            for(let key in nextProps.attrChecked){
                if(nextProps.attrChecked[key]===true)
                    checkedArr.push({name:key,value:true})
            }
            const data=JSON.parse(JSON.stringify(this.state.data));
            const {attrValue}=nextProps;
            data.forEach((value:any)=>{
                for(let i in checkedArr){
                    let attr=value.attr[checkedArr[i].name];
                    if(attr<attrValue[checkedArr[i].name][0] || attr>attrValue[checkedArr[i].name][1]){
                        value.opacity=0;
                        return ;
                    }
                }
                value.opacity=0.1
            })
            this.setState({data:data});
        }
        if(nextProps.reTsneData!==this.props.reTsneData){
            // this.compute(nextProps.reTsneData);
            // this.setState({data:nextProps.reTsneData});
        }
    }
    render(){
        //所有线
        let path=this.state.data.map((value:any,index:number)=>
            {
                return (<path d={this.line(value.pathData)} key={index} strokeWidth={1.5} strokeOpacity={'opacity' in value?value.opacity:0.1} stroke={this.pathStroke} fill='none' ></path>)
            }
        )
        //圈选的点，匹配到的点
        let pathChoose=this.props.choosePoints.map((value:any,index:number)=>{
            for(let i in this.state.data){
                if(this.state.data[i].id===value.id){
                    return (<path d={this.line(this.state.data[i].pathData)} key={index} strokeWidth={1.5} strokeOpacity={0.5} stroke={this.pathStrokeChoose} fill='none'></path>)
                }
            }
            return null;
        })
        //点击的点，需要匹配的点
        let pathCenter=null;
        for(let i in this.state.data){
            if(this.state.data[i].id===this.props.centerPoint.id){
                console.log("true")
                pathCenter=<path d={this.line(this.state.data[i].pathData)} strokeWidth={1.5} strokeOpacity={0.5} stroke={this.pathStrokeCenter} fill='none'></path>
                break;
            }
        }

        return (
            <div className='parallel'>
                <svg style={{width:'100%',height:'100%'}} ref={this.svgRef} id='svg_parallel'>
                    {path}
                    {pathChoose}
                    {pathCenter}
                    <g className="axis"></g>
                    <g className="text"></g>
                </svg>
            </div>
        )
    }
}
export default Parallel;