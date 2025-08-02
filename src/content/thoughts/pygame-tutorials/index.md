---
title: "Pygame入门到入土"
date: 2025-08-02T19:14:37+08:00
lastmod: 2025-08-02T19:14:37+08:00
author: "Z"
draft: false
description: "Pygame 游戏开发完整教程，包含环境配置、基本用法、图形学、UI交互和项目实战"
tags: ['Pygame', '游戏开发', 'Python', '教程', '学习', '开发', '编程']
categories: [  ]
# series: [ "" ]
# series_order: 
---

#  一.pygame简介

* Pygame 是一种流行的Python游戏开发库，它提供了许多功能，使开发人员可以轻松创建2D游戏。它具有良好的跨平台支持，可以在多个操作系统上运行，例如Windows，MacOS和Linux


## 二.环境配置

### 2.1 pygame安装
<br>
* Pygame的安装非常简单，只需要使用pip命令即可。


```python
pip install pygame
```

### 2.2 导入库


```python
import pygame
```

### 2.3 检查结果


```python
print(pygame.ver)

```

## 三 基本用法介绍


### 3.1.1 计算坐标系（Computer coordinate system）


* 对于2D坐标系而言，只需要需要确定原点，以及规定坐标轴的方向即可。
* 在2D坐标系中对点的定位，可用（x,y）表示，x表示x轴上的分量也是到y轴的距离，同理y表示y轴上的分量也是到x轴的距离  （x，y）坐标表示中，x y的大小代表距离，x y的正负则代表方向
* pygame中的坐标系中原点在左上角(0,0)，x轴水平向右，逐渐增加,反之减少，y轴水平向下，逐渐增加，反之减少。

<img src=./assets/tutorials/Computer_coordinates_2D.png height=250 style="margin-left: 80px;">



### 3.1.2 pygame基础库（Pygame Library）

* Pygame提供了各种游戏开发所需的工具和功能。Pygame在SDL（Simple Direct Media Layer，使用C语言编写的多媒体开发库）的基础上开发而成，它提供了诸多操作模块，比如图像模块（image）、声音模块（mixer）、输入/输出（鼠标、键盘、显示屏）模块等。相比于开发3D游戏而言，Pygame更擅长开发2D游戏，

<img src=./assets/tutorials/module.jpg height=520 style="margin-left: 80px;">


#### 3.1.3 基本流程

* #### 3.1.3.1 初始化


```python
import pygame

pygame.init()  # 要使用pygame提供的所有功能之前,需要调用init方法
```

* #### 3.1.3.2 颜色填充

* Pygame使用的颜色系统是很多计算机语言和程序的通用系统，称为RGB（red, green, blue），Pygame还提供了一个命名颜色的列表，也可以自行定义颜色。


```python
colors = [color for color in pygame.color.THECOLORS.keys()]
colors
```


```python
# 定义程序所需颜色变量
BLACK    = (   0,   0,   0)
WHITE    = ( 255, 255, 255)
GREEN    = (   0, 255,   0)
RED      = ( 255,   0,   0)
BLUE     = (   0,   0, 255)
GRAY     = ( 123, 112, 113)
SKYBLUE  = (  65, 146, 247)
CRIMSON  = ( 234,  51,  35)
```

* #### 3.1.3.3 窗口初始化


* pygame提供了一个模块pygame.display用于创建,管理游戏窗口


```python
# 初始化游戏窗口
SCREEN_WIDTH = 600
SCREEN_HEIGHT = 400
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("初始化pygame窗口")

```

* #### 3.1.3.4 游戏循环


```python
done = False  # 退出游戏标志位
clock = pygame.time.Clock()  # 控制游戏帧率
 
# -------- 主循环 -----------
while not done:
    # --- 实现监听
    for event in pygame.event.get(): 
        if event.type == pygame.QUIT: 
            done = True 
            pygame.quit()   #卸载所有模块
            sys.exit()  #终止程序，确保退出程序
    # --- 游戏逻辑

    # --- 游戏图形绘制
 
    screen.fill(WHITE)  # 清空屏幕
 
    pygame.display.flip()   # 更新屏幕内容
 
    clock.tick(60)  #限制每秒刷新60次
```

### 3.2 pygame图形学相关

#### 3.2.1 基本图元绘制

* 目前主流的显示器上，是采用光栅扫描显示，所有图形的显示都归结为按照图形的描述将显示设备的光栅像素点点亮。为了输出一个像素，需要将该像素的坐标和颜色信息转换成输出设别的相应指令。通俗的理解，其是由各个像素点组成的画面。

* 而基本图元显示问题是根据基本图元的描述信息来生产像素组合。基本二维图形图元包括点、线、圆弧、多边形、字体符号和位图等。


```python
# 查看draw模块下可用的方法
["pygame.draw.%s" % method for method in dir(pygame.draw) if not method.startswith("__")]
```

* #### 3.2.1.1 绘制直线


```python
help(pygame.draw.line)
```

    Help on built-in function line in module pygame.draw:
    
    line(...)
        line(surface, color, start_pos, end_pos) -> Rect
        line(surface, color, start_pos, end_pos, width=1) -> Rect
        draw a straight line




```python
import math

""" 绘制主循环 """ 
run = True
while run:
  screen.fill((255, 255, 255))
  pygame.draw.line(screen, BLACK, [50, 50], [300, 300], 5)
  pygame.draw.line(screen, BLACK, [550, 50], [300, 300], 5)
  pygame.draw.line(screen, BLACK, [50, 50], [550, 50], 3)
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      run = False
  pygame.display.flip()
pygame.quit()
```

* #### 3.2.1.2 绘制矩形


```python
help(pygame.draw.rect)
```

    Help on built-in function rect in module pygame.draw:
    
    rect(...)
        rect(surface, color, rect) -> Rect
        rect(surface, color, rect, width=0, border_radius=0, border_top_left_radius=-1, border_top_right_radius=-1, border_bottom_left_radius=-1, border_bottom_right_radius=-1) -> Rect
        draw a rectangle




```python
""" 绘制主循环 """ 
run = True
while run:
  screen.fill((255, 255, 255))
  pygame.draw.rect(screen,BLACK,[20,20,250,100],2)
  # pygame.draw.rect(screen, (255, 0, 0), (200, 100, 150, 150))  # 绘制
  # pygame.draw.rect(screen, (255, 0, 0), (200, 100, 150, 150), border_radius = 50, width = 5)  # 绘制 - 圆边
  # pygame.draw.rect(screen, (255, 0, 0), (200, 100, 150, 150), width = 5, border_bottom_right_radius = 50, border_top_left_radius = 25)
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      run = False
  pygame.display.flip()
pygame.quit()
```

* #### 3.2.1.3 绘制圆圈


```python
help(pygame.draw.circle)
```

    Help on built-in function circle in module pygame.draw:
    
    circle(...)
        circle(surface, color, center, radius) -> Rect
        circle(surface, color, center, radius, width=0, draw_top_right=None, draw_top_left=None, draw_bottom_left=None, draw_bottom_right=None) -> Rect
        draw a circle




```python
""" 绘制主循环 """ 
run = True
while run:
  screen.fill((255, 255, 255))
  pygame.draw.circle(screen, (0, 0, 0), (300, 200), 75)  # 绘制圆形
#   pygame.draw.circle(screen, (255, 255, 0), (300, 200), 75, draw_top_right = True, draw_bottom_left = True)   
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      run = False
  pygame.display.flip()
pygame.quit()
```

* #### 3.2.1.4 绘制椭圆形


```python
help(pygame.draw.ellipse)
```

    Help on built-in function ellipse in module pygame.draw:
    
    ellipse(...)
        ellipse(surface, color, rect) -> Rect
        ellipse(surface, color, rect, width=0) -> Rect
        draw an ellipse




```python
""" 绘制主循环 """ 
run = True
while run:
  screen.fill((255, 255, 255))
  pygame.draw.ellipse(screen, BLACK, [20,20,250,100], 2)
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      run = False
  pygame.display.flip()
pygame.quit()
```

* #### 3.2.1.5 绘制圆弧


```python
help(pygame.draw.arc)
```

    Help on built-in function arc in module pygame.draw:
    
    arc(...)
        arc(surface, color, rect, start_angle, stop_angle) -> Rect
        arc(surface, color, rect, start_angle, stop_angle, width=1) -> Rect
        draw an elliptical arc




```python
""" 绘制主循环 """ 
run = True
while run:
  screen.fill((255, 255, 255))
  pygame.draw.arc(screen, (0, 255, 255), (200, 100, 150, 150), 0, 3.14, width = 5)  # 绘制圆弧
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      run = False
  pygame.display.flip()
pygame.quit()
```

* #### 3.2.1.6 绘制多边形


```python
help(pygame.draw.polygon)
```

    Help on built-in function polygon in module pygame.draw:
    
    polygon(...)
        polygon(surface, color, points) -> Rect
        polygon(surface, color, points, width=0) -> Rect
        draw a polygon




```python
""" 绘制主循环 """ 
run = True
while run:
  screen.fill((255, 255, 255))
  pygame.draw.polygon(screen, BLACK, [[100,100], [0,200], [200,200]], 5)
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      run = False
  pygame.display.flip()
pygame.quit()
```

* #### 3.2.1.7 绘制文字


```python
""" 绘制主循环 """ 
run = True
while run:
  screen.fill((255, 255, 255))
  font = pygame.font.SysFont('Calibri', 25, True, False)
  text = font.render("Hello World!",True,BLACK)
  screen.blit(text, [250, 250])
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      run = False
  pygame.display.flip()
pygame.quit()
```

#### 3.2.2 二维基本几何变换

*  图形学中，基本的几何变换主要有缩放、错切、旋转、反射、平移等几个操作。其他的复杂变换可以通过这些基础变换组合实现。


```python
# pygame二维变换相关方法
["pygame.transform.%s" % method for method in dir(pygame.transform) if not method.startswith("__")]
```

* #### 3.2.2.1 平移变换

* pygame实现通过改变绘制图案位置来进行对其的平移变换。


```python
import math 

# 初始化物体形状
image = pygame.Surface((50, 50))
image.fill((255, 255, 255))
clock = pygame.time.Clock()
# 获取图片原始宽高
rect = image.get_rect()
rect.x = 100
# 初始化位移参数
rect.y = 100
speed = 5
FPS = 60

""" 移动物体方法 """
def move(dx, dy):
  rect.x += dx * speed
  rect.y += dy * speed

""" 控制物体运动Demo循环 """
run = True
while run:
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      run = False
      pygame.quit()
  keys = pygame.key.get_pressed()
  if keys[pygame.K_RIGHT]:
    move(1, 0)
  if keys[pygame.K_LEFT]:
    move(-1, 0)
  if keys[pygame.K_UP]:
    move(0, -1)
  if keys[pygame.K_DOWN]:
    move(0, 1)
  screen.fill(BLACK)
  screen.blit(image, rect)
  pygame.display.flip()
  clock.tick(FPS)


```

* #### 3.2.2.2 比例变换


```python
help(pygame.transform.scale)
```

    Help on built-in function scale in module pygame.transform:
    
    scale(...)
        scale(surface, size, dest_surface=None) -> Surface
        resize to new resolution




```python
import math 

# 初始化物体
dino = pygame.image.load("assets/geometric-transformation/images/dino.png").convert_alpha()
x = 300
y = 200
# 获取图片原始宽高
w = dino.get_width()
h = dino.get_height()

""" 旋转物体控制主循环 """
run = True
while run:
  screen.fill(WHITE)
  pos = pygame.mouse.get_pos()
  w = dino.get_width()
  h = dino.get_height()
  # 原始图片
  origin_dino = pygame.transform.scale(dino, (w, h ))
  dino_rect = dino.get_rect(center = (x-20, y))
  screen.blit(origin_dino, dino_rect)
  # 缩小图片
  resized_dino_small = pygame.transform.scale(dino, (w * 0.5, h * 0.5))
  dino_rect = dino.get_rect(center = (x-120, y+60))
  screen.blit(resized_dino_small, dino_rect)
  # 放大图片
  resized_dino_big = pygame.transform.scale(dino, (w * 1.5, h * 1.5))
  dino_rect = dino.get_rect(center = (x+120, y-60))
  screen.blit(resized_dino_big, dino_rect)
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      run = False
  pygame.display.flip()
```

* #### 3.2.2.3 旋转变换


```python
help(pygame.transform.rotate)
```

    Help on built-in function rotate in module pygame.transform:
    
    rotate(...)
        rotate(surface, angle) -> Surface
        rotate an image




```python
import math 

""" 初始化物体 """
turret_original = pygame.image.load("assets/geometric-transformation/images/Handgun1.png").convert_alpha()
x = 300
y = 200

""" 旋转物体控制主循环 """
run = True
while run:
  screen.fill(GRAY)
  pos = pygame.mouse.get_pos()
  x_dist = pos[0] - x
  y_dist = -(pos[1] - y)
  angle = math.degrees(math.atan2(y_dist, x_dist))
  turret = pygame.transform.rotate(turret_original, angle)
  turret_rect = turret.get_rect(center = (x, y))
  screen.blit(turret, turret_rect)
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      run = False
  pygame.display.flip()
```

* #### 3.2.2.4 对称变换


```python
help(pygame.transform.flip)
```

    Help on built-in function flip in module pygame.transform:
    
    flip(...)
        flip(surface, flip_x, flip_y) -> Surface
        flip vertically and horizontally




```python
import math 

# 初始化物体
dino = pygame.image.load("assets/geometric-transformation/images/dino.png").convert_alpha()
x = 300
y = 200
# 获取图片原始宽高
w = dino.get_width()
h = dino.get_height()
is_flip = False

""" 旋转物体控制主循环 """
run = True
while run:
  screen.fill(CRIMSON)
  pos = pygame.mouse.get_pos()
  key = pygame.key.get_pressed()
  if key[pygame.K_LEFT]:
    is_flip = True
  if key[pygame.K_RIGHT]:
    is_flip = False
  flipped_dino = pygame.transform.flip(dino, is_flip, False)
  dino_rect = dino.get_rect(center = (x-40 if is_flip else x, y))
  screen.blit(flipped_dino, dino_rect)
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      run = False
  pygame.display.flip()
```

### 3.3 精灵图（Sprite）

#### 3.3.1 精灵图集


* Sprite sheet是按网格排列的精灵(Sprite)集合。然后将这些精灵(Sprite)编译成一个动画剪辑(Animation Clip)，按顺序播放每个精灵(Sprite)，以创建动画效果，就像翻书一样。

* #### 3.3.1.2 加载精灵图集


```python
help(pygame.image.load)
```

    Help on built-in function load in module pygame.image:
    
    load(...)
        load(filename) -> Surface
        load(fileobj, namehint=) -> Surface
        load new image from a file (or file-like object)




```python
""" 加载资源 """
pygame.display.set_caption('精灵图集')
sprite_sheet_image = pygame.image.load('assets/spritesheet/doux.png').convert_alpha()

```


```python
""" 定义精灵图集类并初始化 """
class SpriteSheet():
	def __init__(self, image):
		self.sheet = image

	def get_image(self, frame, width, height, scale, colour):
		image = pygame.Surface((width, height)).convert_alpha()
		image.blit(self.sheet, (0, 0), ((frame * width), 0, width, height))
		image = pygame.transform.scale(image, (width * scale, height * scale))
		image.set_colorkey(colour)

		return image

sprite_sheet = SpriteSheet(sprite_sheet_image)
```


```python
""" 处理原始图集 """
BG = (50, 50, 50)

frame_0 = sprite_sheet.get_image(0, 24, 24, 3, BLACK)
frame_1 = sprite_sheet.get_image(1, 24, 24, 3, BLACK)
frame_2 = sprite_sheet.get_image(2, 24, 24, 3, BLACK)
frame_3 = sprite_sheet.get_image(3, 24, 24, 3, BLACK)

""" 将处理后的图集绘制屏幕 """
run = True
while run:
	screen.fill(BG)
	screen.blit(frame_0, (0, 0))
	screen.blit(frame_1, (72, 0))
	screen.blit(frame_2, (150, 0))
	screen.blit(frame_3, (250, 0))
	for event in pygame.event.get():
		if event.type == pygame.QUIT:
			run = False
	pygame.display.update()

pygame.quit()
```

* #### 3.3.1.2 动画帧实现

* 3.3.1.2.1 基础图集动画


```python
""" 将图集加载在列表，方便动画制作 """
animation_list = []
animation_steps = [4,6,3,4]
action = 1
last_update = pygame.time.get_ticks()
animation_cooldown = 75
frame = 0
step_counter = 0

for animation in animation_steps:
	temp_img_list = []
	for _ in range(animation):
		temp_img_list.append(sprite_sheet.get_image(step_counter, 24, 24, 3, BLACK))
		step_counter += 1
	animation_list.append(temp_img_list)

```


```python
""" 实现动作逻辑"""
run = True
while run:
	screen.fill(BG)
	current_time = pygame.time.get_ticks()
	if current_time - last_update >= animation_cooldown:
		frame += 1
		last_update = current_time
		if frame >= len(animation_list):
			frame = 0
	for event in pygame.event.get():
		if event.type == pygame.QUIT:
			run = False
	screen.blit(animation_list[action][frame], (0,0))
	for event in pygame.event.get():
		if event.type == pygame.QUIT:
			run = False
	pygame.display.update()

pygame.quit()
```

* 3.3.1.2.2 背景卷轴动画

* 背景卷轴是2D横版游戏的里程碑技术（Defender、Super Mario Bro）。

* 而实现2D卷轴，除了控制景深摄像机的移动之外还可以通过移动背景图实现卷轴效果.


```python
""" 初始化程序窗体 """
clock = pygame.time.Clock()
FPS = 60
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 432
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("mmm")
```


```python
""" 初始化卷轴动画相关素材 """
scroll = 0
ground_image = pygame.image.load("assets/parallax/images/ground.png").convert_alpha()
ground_width = ground_image.get_width()
ground_height = ground_image.get_height()
bg_images = []
for i in range(1, 6):
  bg_image = pygame.image.load(f"assets/parallax/images/plx-{i}.png").convert_alpha()
  bg_images.append(bg_image)
bg_width = bg_images[0].get_width()

```


```python
""" 绘制背景相关方法 """
def draw_bg():
  for x in range(5):
    speed = 1
    for i in bg_images:
      screen.blit(i, ((x * bg_width) - scroll * speed, 0))
      speed += 0.2

def draw_ground():
  for x in range(15):
    screen.blit(ground_image, ((x * ground_width) - scroll * 2.5, SCREEN_HEIGHT - ground_height))
```


```python
""" 主程序循环 """
run = True
while run:
  clock.tick(FPS)
  draw_bg()
  draw_ground()
  key = pygame.key.get_pressed()
  if key[pygame.K_LEFT] and scroll > 0:
    scroll -= 5
  if key[pygame.K_RIGHT] and scroll < 3000:
    scroll += 5
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      run = False
  pygame.display.update()

pygame.quit()
```

### 3.4 UI

* #### 3.4.1 导入所需库


```python
import pygame
import random
```

* #### 3.4.2 初始化窗体


```python
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 450
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption('界面相关')

```

* #### 3.4.3 资源加载


```python
start_img = pygame.image.load('assets/ui_interation/images/start_btn.png').convert_alpha()
exit_img = pygame.image.load('assets/ui_interation/images/exit_btn.png').convert_alpha()

```

* #### 3.4.4 基础实体类


```python
class Button():
	def __init__(self, x, y, image, scale):
		width = image.get_width()
		height = image.get_height()
		self.image = pygame.transform.scale(image, (int(width * scale), int(height * scale)))
		self.rect = self.image.get_rect()
		self.rect.topleft = (x, y)
		self.clicked = False

	def draw(self, surface):
		action = False
		pos = pygame.mouse.get_pos()
		if self.rect.collidepoint(pos):
			if pygame.mouse.get_pressed()[0] == 1 and self.clicked == False:
				self.clicked = True
				action = True
		if pygame.mouse.get_pressed()[0] == 0:
			self.clicked = False
		surface.blit(self.image, (self.rect.x, self.rect.y))
		return action

start_button = Button(100, 200, start_img, 0.8)
exit_button = Button(450, 200, exit_img, 0.8)
```

* #### 3.4.5 界面交互(按钮点击)


```python

run = True
while run:
	screen.fill((202, 228, 241))
	if start_button.draw(screen):
		print('开始按钮被点击')
	if exit_button.draw(screen):
		print('退出按钮被点击')
	for event in pygame.event.get():
		if event.type == pygame.QUIT:
			run = False
	pygame.display.update()

pygame.quit()
```

* #### 3.3.6 界面交互（拖拽UI）


```python
""" 初始化放置物品 """
active_box = None
boxes = []
for i in range(5):
  x = random.randint(50, 700)
  y = random.randint(50, 350)
  w = random.randint(35, 65)
  h = random.randint(35, 65)
  box = pygame.Rect(x, y, w, h)
  boxes.append(box)
```


```python
""" 实现碰撞检测和鼠标按键监听 """
run = True
while run:
  screen.fill("white")
  for box in boxes:
    pygame.draw.rect(screen, "pink", box)
  for event in pygame.event.get():
    if event.type == pygame.MOUSEBUTTONDOWN:
      if event.button == 1:
        for num, box in enumerate(boxes):
          if box.collidepoint(event.pos):
            active_box = num
    if event.type == pygame.MOUSEBUTTONUP:
      if event.button == 1:
        active_box = None
    if event.type == pygame.MOUSEMOTION:
      if active_box != None:
        boxes[active_box].move_ip(event.rel)
    if event.type == pygame.QUIT:
      run = False
  pygame.display.flip()
pygame.quit()
```

### 3.4 音效

* Pygame可以加载多种类型的音频文件，如WAV、MP3等。主要通过pygame.mixer模块来实现对音效的处理,该模块可以依据命令播放一个或多个声音，并且也可以将这些声音混合在一起。

* pygame主要处理两种声音，一种是背景音乐，一种是音效。


```python
# 播放音效
sound = pygame.mixer.Sound('./assets/audio/bullet.wav')
sound.set_volume(0.9)
pygame.mixer.Sound.play(sound)
```


```python
# 播放背景音乐
music = pygame.mixer.music.load('./assets/audio/mario.mp3')
pygame.mixer.music.play(-1)
```


```python
# 关闭背景音乐
pygame.mixer.music.stop()
```

# 四.项目实战

### 4.1 分形图-模拟类

* 曼德勃罗集合（Mandelbrot set）是一个在复平面上定义的数学集合，以法国数学家Benoit Mandelbrot的名字命名。它是由一系列复数构成的，每个复数代表平面上的一个点。

* 曼德勃罗集合中的点具有特定的性质，对于某些点，当它们通过迭代计算的方式进行运算时，结果会趋于无穷大。而对于其他点，计算结果则会保持有限。其可以通过迭代计算来确定。对于每个复数c，我们将其作为初始值z0，并通过以下公式进行迭代计算：zn+1 = zn^2 + c。

* 在每次迭代中，我们将计算得到的结果作为下一次迭代的初始值，直到满足某个条件为止。如果在有限次迭代后，计算结果仍然保持有限，则认为该点属于曼德勃罗集合。



* #### 4.1.1 初始化


```python
import pygame

pygame.init()

screen = pygame.display.set_mode((400, 400))
pygame.display.set_caption("Mandelbrot set")
```

* #### 4.1.2 绘制方法


```python

def fractal():
    for y in range(400): 
        for x in range(400): 
            zx, zy = cx, cy = -2 + 2.5 * x / 400.0, -1.25 + 2.5 * y / 400.0 
            for i in range(25): 
                zx, zy = zx * zx - zy * zy + cx, 2 * zx * zy + cy
                if zx * zx + zy * zy > 4: 
                    break
                screen.set_at((x, y), ((250 - 25 * i) * 0x10101)) 
    pygame.display.update() 

```

* #### 4.1.3 程序逻辑


```python
run = True
while run:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            run = False
    screen.fill((255, 255, 255))
    fractal()
    pygame.display.update()
pygame.quit()

```

### 4.2 flappy Bird-游戏类

* Flappy Bird 是一款由越南游戏开发者Dong Nguyen开发的简单但受欢迎的手机游戏。游戏于2013年5月发布，迅速在全球范围内走红。

* 游戏的玩法非常简单，玩家需要控制一只小鸟通过不断上下移动的管道障碍物。玩家通过点击屏幕使小鸟上升，松开手指则小鸟下降，需要巧妙地掌握时机和力度，避免撞到管道或掉落到地面上。游戏的目标是尽可能地飞过更多的管道，获取更高的分数。



* #### 4.2.1 导入所需库以及初始化


```python
# 导入需要的库
import pygame
from pygame.locals import *
import random

```

* #### 4.2.2 窗体初始化


```python
pygame.init()
clock = pygame.time.Clock()
fps = 60
screen_width = 864
screen_height = 936
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption('Flappy Bird')

```


```python
font = pygame.font.SysFont('Bauhaus 93', 60)
white = (255, 255, 255)
ground_scroll = 0
scroll_speed = 4
flying = False
game_over = False
pipe_gap = 150
pipe_frequency = 1500
last_pipe = pygame.time.get_ticks() - pipe_frequency
score = 0
pass_pipe = False
```


```python

bg = pygame.image.load('assets/flappybird/images/bg.png')
ground_img = pygame.image.load('assets/flappybird/images/ground.png')
button_img = pygame.image.load('assets/flappybird/images/restart.png')
```

* #### 4.2.3 实体类


```python
""" 小鸟类 """
class Bird(pygame.sprite.Sprite):
	def __init__(self, x, y):
		pygame.sprite.Sprite.__init__(self)
		self.images = []
		self.index = 0
		self.counter = 0
		for num in range(1, 4):
			img = pygame.image.load(f'assets/flappybird/images/bird{num}.png')
			self.images.append(img)
		self.image = self.images[self.index]
		self.rect = self.image.get_rect()
		self.rect.center = [x, y]
		self.vel = 0
		self.clicked = False

	def update(self):
		if flying == True:
			self.vel += 0.5
			if self.vel > 8:
				self.vel = 8
			if self.rect.bottom < 768:
				self.rect.y += int(self.vel)
		if game_over == False:
			if pygame.mouse.get_pressed()[0] == 1 and self.clicked == False:
				self.clicked = True
				self.vel = -10
			if pygame.mouse.get_pressed()[0] == 0:
				self.clicked = False
			self.counter += 1
			flap_cooldown = 5
			if self.counter > flap_cooldown:
				self.counter = 0
				self.index += 1
				if self.index >= len(self.images):
					self.index = 0
			self.image = self.images[self.index]
			self.image = pygame.transform.rotate(self.images[self.index], self.vel * -2)
		else:
			self.image = pygame.transform.rotate(self.images[self.index], -90)

```


```python
""" 管道类 """
class Pipe(pygame.sprite.Sprite):
	def __init__(self, x, y, position):
		pygame.sprite.Sprite.__init__(self)
		self.image = pygame.image.load('assets/flappybird/images/pipe.png')
		self.rect = self.image.get_rect()
		if position == 1:
			self.image = pygame.transform.flip(self.image, False, True)
			self.rect.bottomleft = [x, y - int(pipe_gap / 2)]
		if position == -1:
			self.rect.topleft = [x, y + int(pipe_gap / 2)]

	def update(self):
		self.rect.x -= scroll_speed
		if self.rect.right < 0:
			self.kill()

```


```python
""" 界面按钮类 """
class Button():
	def __init__(self, x, y, image):
		self.image = image
		self.rect = self.image.get_rect()
		self.rect.topleft = (x, y)

	def draw(self):
		action = False
		pos = pygame.mouse.get_pos()
		if self.rect.collidepoint(pos):
			if pygame.mouse.get_pressed()[0] == 1:
				action = True
		screen.blit(self.image, (self.rect.x, self.rect.y))
		return action
```

* #### 4.2.4 游戏逻辑


```python
""" 初始化游戏对象 """
bird_group = pygame.sprite.Group()
pipe_group = pygame.sprite.Group()
flappy = Bird(100, int(screen_height / 2))
bird_group.add(flappy)
button = Button(screen_width // 2 - 50, screen_height // 2 - 100, button_img)
```


```python
""" 绘制文字 """
def draw_text(text, font, text_col, x, y):
	img = font.render(text, True, text_col)
	screen.blit(img, (x, y))

""" 重置游戏 """
def reset_game():
	pipe_group.empty()
	flappy.rect.x = 100
	flappy.rect.y = int(screen_height / 2)
	score = 0
	return score
```


```python
""" 游戏循环 """
run = True
while run:
	clock.tick(fps)
	screen.blit(bg, (0,0))
	bird_group.draw(screen)
	bird_group.update()
	pipe_group.draw(screen)
	screen.blit(ground_img, (ground_scroll, 768))
	if len(pipe_group) > 0:
		if bird_group.sprites()[0].rect.left > pipe_group.sprites()[0].rect.left\
			and bird_group.sprites()[0].rect.right < pipe_group.sprites()[0].rect.right\
			and pass_pipe == False:
			pass_pipe = True
		if pass_pipe == True:
			if bird_group.sprites()[0].rect.left > pipe_group.sprites()[0].rect.right:
				score += 1
				pass_pipe = False
	draw_text(str(score), font, white, int(screen_width / 2), 20)
	if pygame.sprite.groupcollide(bird_group, pipe_group, False, False) or flappy.rect.top < 0:
		game_over = True
	if flappy.rect.bottom >= 768:
		game_over = True
		flying = False
	if not game_over and flying:
		time_now = pygame.time.get_ticks()
		if time_now - last_pipe > pipe_frequency:
			pipe_height = random.randint(-100, 100)
			btm_pipe = Pipe(screen_width, int(screen_height / 2) + pipe_height, -1)
			top_pipe = Pipe(screen_width, int(screen_height / 2) + pipe_height, 1)
			pipe_group.add(btm_pipe)
			pipe_group.add(top_pipe)
			last_pipe = time_now
		ground_scroll -= scroll_speed
		if abs(ground_scroll) > 35:
			ground_scroll = 0
		pipe_group.update()
	if game_over:
		if button.draw() == True:
			game_over = False
			score = reset_game()
	for event in pygame.event.get():
		if event.type == pygame.QUIT:
			run = False
		if event.type == pygame.MOUSEBUTTONDOWN and flying == False and game_over == False:
			flying = True
	pygame.display.update()

pygame.quit()
```
