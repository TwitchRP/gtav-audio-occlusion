import { Big } from "big.js";

interface BV3 
{
    x: Big;
    y: Big;
    z: Big;
}

export class BigVector3 implements BV3
{
  x: Big;
  y: Big;
  z: Big;

  constructor(val: BigVector3|BV3|Vector3)
  {
    this.x = (val.x instanceof Big) ? val.x : new Big(val.x)
    this.y = (val.y instanceof Big) ? val.y : new Big(val.y)
    this.z = (val.z instanceof Big) ? val.z : new Big(val.z)
  }

  minus(v: BigVector3): BigVector3
  {
    return new BigVector3({
      x: this.x.minus(v.x),
      y: this.y.minus(v.y),
      z: this.z.minus(v.z)
    })
  }

  div(n: number): BigVector3
  {
    return new BigVector3({
      x: this.x.div(n),
      y: this.y.div(n),
      z: this.z.div(n)
    })
  }

  plus(v: BigVector3): BigVector3
  {
    return new BigVector3({
      x: this.x.plus(v.x),
      y: this.y.plus(v.y),
      z: this.z.plus(v.z)
    })
  }

  add(n: number): BigVector3
  {
    return new BigVector3({
      x: this.x.plus(n),
      y: this.y.plus(n),
      z: this.z.plus(n)
    })
  }

  toVector3(): Vector3
  {
    return {
      x: this.x.toString(),
      y: this.y.toString(),
      z: this.z.toString()
    }
  }
}
