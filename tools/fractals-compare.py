# Side by side: the concept art (top) and the render (bottom), for review. python3 tools/fractals-compare.py concept.jpg render.jpg out.jpg
import sys
from PIL import Image
a=Image.open(sys.argv[1]).convert('RGB').resize((1280,720));b=Image.open(sys.argv[2]).convert('RGB').resize((1280,720))
m=Image.new('RGB',(1280,1440));m.paste(a,(0,0));m.paste(b,(0,720));m.save(sys.argv[3],quality=88)
