// The scene's frame. On narrow screens (portrait) the camera pulls back so that the screen is at least 1.24 scene heights wide
// (SB_FIT in sabana-gl.js): ASP is the half width of the screen in scene units. G0: the ground (world y = 0) in scene units.
void main(){hourLight();P=pScreen();vec2 q=at(0.);PX=pxAt(0.);ASP=max(.5*uR.x/uR.y,.62);G0=-uScene.y/uScene.z;
 scene(q,uTau);OF=F*uAlpha;}
