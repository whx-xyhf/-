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
    dataType:string,
    personGraphs:Array<attr>
}
type attr={
    [propName: string]: any,
  }

class Parallel extends React.Component<Props,any>{
    private svgRef:React.RefObject<SVGSVGElement>;
    public svgWidth:number=0;
    public svgHeight:number=0;
    public padding={top:30,bottom:30,left:30,right:100};
    public pathStroke:string='#ccc';
    public pathStrokeChoose:string='#2987E4'//'#99CCFF';
    public pathStrokeCenter:string='red';
    // public rectColor:Array<string>=['#FEF0D9','#FDCC8A','#FC8D59','#E34A33','#B30000'];
    public rectHeight:number=4;
    public yscale:any=null;
    public rectWidthMax:number=0;
    // public rectColor=d3.interpolate(d3.rgb(254,240,217),d3.rgb(179,0,0));
    public rectColor=d3.interpolateRdYlGn;
    constructor(props:Props){
        super(props);
        this.svgRef=React.createRef();
        this.state={data:[],rect:{}};
        this.getAttrData=this.getAttrData.bind(this);
        this.compute=this.compute.bind(this);
    }
    compute(data:any,updateAttr:boolean):void{
        let attr_name:Array<string>=[];
        let str_name:Array<string>=[];
        let rectNum=Math.ceil((this.svgHeight-this.padding.bottom-this.padding.top)/this.rectHeight)+1;
        let rectArray:attr={};
        for(let key in data[0].attr){
            attr_name.push(key);
            rectArray[key]=[];
        }
        for(let key in data[0].str){
            str_name.push(key);
        }
        //x方向比例尺
        let xscale=d3.scalePoint(attr_name,[this.padding.left,this.svgWidth-this.padding.right]);
        //y方向比例尺
        let min_max:any=new Map(Array.from(attr_name, key => [key,d3.extent(data, (d:any) => d.attr[key])]));
        let attr:attr={};
        let checked:attr={};
        attr_name.forEach((value:string)=>{
            checked[value]=true;
            attr[value]=min_max.get(value);
        })
        if(updateAttr){
            this.props.parent.setAttr(attr);
            this.props.parent.initAttrChecked(checked);
            this.props.parent.setAttrList(attr_name);
            this.props.parent.setStrList(str_name);
        }

        let yscale:any = new Map(Array.from(attr_name, key => [key, d3.scaleLinear(min_max.get(key), [this.svgHeight-this.padding.bottom, this.padding.top])]));
        this.yscale=yscale;
        for(let i in rectArray){
            for(let j=0;j<rectNum;j++){
                rectArray[i].push([xscale(i),this.svgHeight-this.padding.bottom-j*this.rectHeight,0,0])//[x,y,height,color]
            }
        }
        for(let i in data){
            let pathData=[];
            for(let j in data[i].attr){
                let y=Math.floor((this.svgHeight-this.padding.bottom-yscale.get(j)(data[i].attr[j]))/this.rectHeight);
                rectArray[j][y][3]+=data[i].attr[j];
                pathData.push([xscale(j),yscale.get(j)(data[i].attr[j])]);
                rectArray[j][y][2]+=1;
            }
            data[i].pathData=pathData;
        }
        let rectx1=xscale(attr_name[1]) || 0;
        let rectx2=xscale(attr_name[0]) || 0;
        let rectWidthMax=(rectx1-rectx2)/2-10>this.padding.left-5?this.padding.left-5:(rectx1-rectx2)/2-10;
        this.rectWidthMax=rectWidthMax;
        for(let i in rectArray){
            let v=d3.extent(rectArray[i],(d:Array<number>)=>{ if(d[2]!==0) return Math.sqrt(d[2])});
            let c=d3.extent(rectArray[i],(d:Array<number>)=>{ if(d[2]!==0) return d[3]/d[2]});
            if(v[0]===v[1] && c[0]===c[1])
                c[0]=0;
            let rectWidthScale=d3.scaleLinear(v,[5,rectWidthMax]);
            // let mean=d3.mean(rectArray[i],(d:any)=>d[3])||0;
            // let std=this.getStd(rectArray[i],mean);
            // console.log(mean,std)
            let colorScale=d3.scaleLinear(c,[0,1]);
    
            rectArray[i].forEach((value:Array<number>)=>{
                if(value[2]!==0){
                    value[3]=colorScale(value[3]/value[2]);
                    value[2]=rectWidthScale(Math.sqrt(value[2]));
                    // value[3]=(value[3]-mean)/std/4+0.5;
                }
            })
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
       
       
        this.setState({data:data,rect:rectArray});
    }
    getAttrData(dataType:string):void{
        axios.post(this.props.url,{dataType:dataType})
        .then(res=>{
            this.compute(res.data.data,true);
        })
    }
    componentDidMount():void{
        this.svgWidth=this.svgRef.current?.clientWidth || 0;
        this.svgHeight=this.svgRef.current?.clientHeight || 0;
        this.getAttrData(this.props.dataType);
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
    // getStd(values: Array<number>,mean:number,valueof: (datum: any, index: number, array: Iterable<number>) => number
    // ):number{
    //     let count = 0;
    //     let sum = 0;
    //     if (valueof === undefined) {
    //         for (let value of values) {
    //         if (value != null ) {
    //             ++count, sum += Math.pow(value-mean,2);
    //         }
    //         }
    //     } else {
    //         let index = -1;
    //         for (let value of values) {
    //             if ((value = valueof(value, ++index, values)) != null) {
    //                 ++count, sum += Math.pow(value-mean,2);
    //             }
    //         }
    //     }
    //     return Math.sqrt(sum)/ count;
        
    // }
    getStd(values:any,mean:number):number{
        let count=0,sum=0;
        for(let i in values){
            sum+=Math.pow(values[i][3]-mean,2);
            count+=1;
        }
        return Math.sqrt(sum)/ count;
    }
    componentWillReceiveProps(nextProps:Props){
        if(nextProps.attrValue!==this.props.attrValue){
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
            const {attrValue,attrChecked}=nextProps;
            let reTsneData=JSON.parse(JSON.stringify(nextProps.reTsneData));
            let checkedArr:any=[];
            for(let key in attrChecked){
                if(attrChecked[key]===true)
                    checkedArr.push({name:key,value:true})
            }
            reTsneData.forEach((value:any)=>{
                for(let i in checkedArr){
                    let attr=value.attr[checkedArr[i].name];
                    if(attr<attrValue[checkedArr[i].name][0] || attr>attrValue[checkedArr[i].name][1]){
                        value.opacity=0;
                        return ;
                    }
                }
                value.opacity=0.1
            })
            this.compute(reTsneData,false);
        }
        if(nextProps.dataType!==this.props.dataType){
            this.getAttrData(nextProps.dataType);
        }
        if(nextProps.choosePoints!==this.props.choosePoints){
            
            let rectArray=JSON.parse(JSON.stringify(this.state.rect));
            for(let i in rectArray){
                rectArray[i].forEach((value:Array<number>)=>{
                    value[2]=0;
                    value[3]=0;
                })
            }
            
            nextProps.choosePoints.forEach((value:any)=>{
                for(let i in value.attr){
                    let y=Math.floor((this.svgHeight-this.padding.bottom-this.yscale.get(i)(value.attr[i]))/this.rectHeight);
                    rectArray[i][y][2]+=1;
                    rectArray[i][y][3]+=value.attr[i];
                }
            })

            let rectWidthMax=this.rectWidthMax;
            // console.log(rectArray)
            for(let i in rectArray){
                let v=d3.extent(rectArray[i],(d:Array<number>)=>{ if(d[2]!==0) return Math.sqrt(d[2])});
                let c=d3.extent(rectArray[i],(d:Array<number>)=>{ if(d[2]!==0) return d[3]/d[2]});
                let rectWidthScale=d3.scaleLinear(v,[5,rectWidthMax]);
                // let mean=d3.mean(rectArray[i],(d:any)=>d[3])||0;
                // let std=this.getStd(rectArray[i],mean);
                // console.log(mean,std)
                if(v[0]===v[1] && c[0]===c[1])
                    c[0]=0;
                let colorScale=d3.scaleLinear(c,[0,1]);
        
                rectArray[i].forEach((value:Array<number>)=>{
                    if(value[2]!==0){
                        value[3]=colorScale(value[3]/value[2]);
                        value[2]=rectWidthScale(Math.sqrt(value[2]));
                        // value[3]=(value[3]-mean)/std/4+0.5;
                    }
                })
            }
            this.setState({rect:rectArray});
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
                    return (<path d={this.line(this.state.data[i].pathData)} key={index} strokeWidth={1.5} strokeOpacity={1} stroke={this.pathStrokeChoose} fill='none'></path>)
                }
            }
            return null;
        })
        //点击的点，需要匹配的点
        let pathCenter=null;
        for(let i in this.state.data){
            if(this.state.data[i].id===this.props.centerPoint.id){
                pathCenter=<path d={this.line(this.state.data[i].pathData)} strokeWidth={1.5} strokeOpacity={0.5} stroke={this.pathStrokeCenter} fill='none'></path>
                break;
            }
        }

        //点击的点，试选
        let personGraphs=this.props.personGraphs.map((value:any,index:number)=>{
            for(let i in this.state.data){
                if(this.state.data[i].id===value.id){
                    return (<path d={this.line(this.state.data[i].pathData)} key={index} strokeWidth={1.5} strokeOpacity={0.5} stroke={this.pathStrokeCenter} fill='none'></path>)
                }
            }
            return null;
        })

        //画矩形
        let rectLeft:Array<React.ReactElement>=[];
        let rectRight:Array<React.ReactElement>=[];
        for(let i in this.state.rect){
            this.state.rect[i].forEach((value:Array<number>,index:number)=>{
                if(value[2]!==0){
                    rectRight.push(<rect key={index+'i'+i} x={value[0]-value[2]} y={value[1]-this.rectHeight} height={this.rectHeight} fill={this.rectColor(value[3])} width={value[2]}></rect>)
                    rectLeft.push(<rect key={index+'l'+i} x={value[0]} y={value[1]-this.rectHeight} height={this.rectHeight} fill={this.rectColor(value[3])} width={value[2]}></rect>)
                }
            })
        }


        return (
            <div className='parallel'>
                <svg style={{width:'100%',height:'100%'}} ref={this.svgRef} id='svg_parallel'>
                    {path}
                    {pathChoose}
                    {pathCenter}
                    {personGraphs}
                    {rectLeft}
                    {rectRight}
                    <g className="axis"></g>
                    <g className="text"></g>
                    <defs>
                        <linearGradient id='linearColor' x1="0%" y1="0%" x2='0%' y2="100%">
                            <stop offset="0%" stopColor={this.rectColor(1)}></stop>
                            <stop offset="20%" stopColor={this.rectColor(0.8)}></stop>
                            <stop offset="40%" stopColor={this.rectColor(0.6)}></stop>
                            <stop offset="60%" stopColor={this.rectColor(0.4)}></stop>
                            <stop offset="80%" stopColor={this.rectColor(0.2)}></stop>
                            <stop offset="100%" stopColor={this.rectColor(0)}></stop>
                        </linearGradient>
                    </defs>
                    <rect fill='url(#linearColor)' x={this.svgWidth-this.padding.right/2+10} y={this.svgHeight-this.padding.bottom-100} height={100} width={20}></rect>
                    <text style={{transform:`translate(${this.svgWidth-this.padding.right+85}px,${this.svgHeight-this.padding.bottom-100}px) rotate(90deg)`}}>Z-score</text>
                    <text x={this.svgWidth-this.padding.right/2-5} y={this.svgHeight-this.padding.bottom-95}>2</text>
                    <text x={this.svgWidth-this.padding.right/2-5} y={this.svgHeight-this.padding.bottom-50}>0</text>
                    <text x={this.svgWidth-this.padding.right/2-5} y={this.svgHeight-this.padding.bottom}>-2</text>
                </svg>
            </div>
        )
    }
}
export default Parallel;