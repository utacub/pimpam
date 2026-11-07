// The scene's frame. On narrow screens (portrait) the camera pulls back so that the screen is at least 1.24 scene heights wide
// (FG_FIT in fons-gl.js): ASP is the half width of the screen in scene units.
void main(){vec2 p=pScreen();vec2 w=uCam.xy+p*uCam.z;vec2 q=(w-uScene.xy)/uScene.z;PX=uCam.z/(uScene.z*uR.y);UV=gl_FragCoord.xy/uR;ASP=max(.5*uR.x/uR.y,.62);
 scene(q,uTau);OF=F*uAlpha;}
