/**
 * Created by Administrator on 2017/7/2.
 */

//质量
var mass = 0.1;
//每个点的距离
var restDistance = 25;
//X，Y上各有多少个点
var xSegs = 10 , ySegs = 10;
//衣服函数(输入0.1 得到0.1*restDistance * xSegs)
var clothFunction = plane(restDistance * xSegs , restDistance * ySegs);
//衣服对象
var cloth = new Cloth(xSegs , ySegs , mass);
//时间间隔
var TIMESTEP = 18 / 1000;
//时间间隔的平方
var timeSq = TIMESTEP * TIMESTEP;
//阻力
var dammping = 0.03;
//拉力
var Drag = 1 - dammping;

//重力
var GRAVITY = 981 * 1.4;
var gravity = new THREE.Vector3( 0, - GRAVITY, 0 ).multiplyScalar( mass );

function plane(width , height){
    return function(u , v ){
        var x = u * width;
        var y = v * height;
        return new THREE.Vector3(x , y , 0);
    }
}
//安全拉力系统
var diff = new THREE.Vector3(0 , 0 , 0);
function satisfyConstraints(p1 ,p2 , distance){
    diff.subVectors(p2.position , p1.position);
    var length = diff.length();
    if(length === 0) return;
    var correctDist = diff.multiplyScalar(
        1 - distance/length
    )
    correctDist.multiplyScalar( 0.5 );
    p1.position.add(correctDist);
    p2.position.sub(correctDist)
}

//粒子系统对象
function Particle(x , y , z , mass){
    //位置
    this.position = clothFunction(x , y , z);
    this.prePosition = clothFunction(x , y , z);
    //最初的位置
    this.original = new clothFunction(x , y , z);
    this.acc = new THREE.Vector3(0 , 0 , 0);
    //质量
    this.mass = mass;
    //缓存
    this.tmp = new THREE.Vector3(0 , 0 , 0);
}
//改变加速度对象
Particle.prototype.addForce = function(force){
    this.acc.add(
        this.tmp.copy(force).divideScalar( this.mass))
}
//结合计算
Particle.prototype.integrate = function(timeSq){
    var position = this.position;
    var newPos = new THREE.Vector3().subVectors(this.position, this.prePosition);
    newPos.multiplyScalar(Drag).add(this.position);
    newPos.add(this.acc.multiplyScalar(timeSq)); //加速成以时间的平方
    this.prePosition.copy(position);
    this.position.copy(newPos);
    this.acc.set(0 , 0 , 0);
}

//衣服对象（。。。。。）
function Cloth(w , h , mass){
    this.w = w || w;
    this.h = h || h;

    this.particles = [];
    this.constraints = [];

    //粒子系统
    for(let v = 0 ; v <= h ; v++){
        for(let u = 0 ; u <= w ; u++){
            this.particles.push(
                new Particle(u / w, v / h, 0 , mass)
            )
        }
    }

    //弹力
    // var diagnoalDist = Math.sqrt( restDistance*restDistance*2);
    for(let v = 0 ; v <= h ;v++){
        for(let u = 0 ; u <= w ;u++){
            //横向的矢量
            if( u < w){
                this.constraints.push([
                        this.particles[index(u , v)],
                        this.particles[index(u + 1, v)],
                        restDistance
                    ]
                )
            }
            // //竖着的矢量
            if( v < h){
                this.constraints.push([
                        this.particles[index(u,v)],
                        this.particles[index(u , v + 1)],
                        restDistance
                    ]
                )
            }
            // if( v < h && u < w ){
            //     this.constraints.push([
            //             this.particles[index(u,v)],
            //             this.particles[index(u + 1, v + 1)],
            //             diagnoalDist
            //         ]
            //     )
            //     this.constraints.push([
            //             this.particles[index(u + 1, v)],
            //             this.particles[index(u ,  v + 1)],
            //             diagnoalDist
            //         ]
            //     )
            // }
        }

    }
    function index(u ,v){
        return v*(w+1) + u;
    }

}



//模拟函数
function simulate(){
    var faces = clothGeomtry.faces;
    var partciles = cloth.particles;
    var constraints  = cloth.constraints;
    for(let i = 0 ; i < faces.length ; i++){
        var normal = faces[i].normal;
        var force = normal.normalize().multiplyScalar( normal.dot(windForce) );
        //添加风力
        partciles[faces[i].a].addForce(force);
        partciles[faces[i].b].addForce(force);
        partciles[faces[i].c].addForce(force);
    }

    for(let i = 0 ; i < partciles.length ; i++){
        //给每个点加上重力
        partciles[i].addForce(gravity);
        partciles[i].integrate(timeSq);
    }

    //不让各个点太近或者太远
    for(let i = 0 ; i < constraints.length ; i++){
        satisfyConstraints( constraints[i][0] , constraints[i][1] , constraints[i][2]);
    }

    //使得绑定的点还原
    for(let i = 0 ; i < pins.length ; i++){
        var partcile = cloth.particles[pins[i]];
        partcile.position.copy(partcile.original);
        partcile.prePosition.copy(partcile.original);
    }
    //检验所有的点 如果 不能超出地板范围
    // for(let i = 0 ; i < partciles.length ; i++){
    //     var partcile = partciles[i];
    //     if(partcile.position.y < -450){
    //         partcile.position.y = - 450;
    //     }
    // }
}




