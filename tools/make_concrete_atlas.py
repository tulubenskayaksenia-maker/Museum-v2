"""
Генератор текстуры «заброшенный бетон» (альбедо + карта нормалей).

Запуск (из корня проекта):
    python3 tools/make_concrete_atlas.py

Создаёт:
    assets/textures/wall_atlas.jpg   — цвет (сколы, арматура, швы, потёки, трещины)
    assets/textures/wall_atlas_n.jpg — рельеф

Один кусок покрывает ~20 единиц стены и бесшовно повторяется.
Меняй seed (SEED), чтобы получить другой рисунок.
"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.spatial import cKDTree

SEED = 41
N = 2048
rng = np.random.default_rng(SEED)

Y, X = np.mgrid[0:N, 0:N].astype(np.float32)


def field(beta, ax=1.0, ay=1.0):
    fy = np.fft.fftfreq(N)[:, None] * ay
    fx = np.fft.rfftfreq(N)[None, :] * ax
    f = fx ** 2 + fy ** 2
    f[0, 0] = 1
    amp = f ** (-beta / 2)
    amp[0, 0] = 0
    spec = (rng.normal(size=amp.shape) + 1j * rng.normal(size=amp.shape)) * amp
    a = np.fft.irfft2(spec, s=(N, N)).astype(np.float32)
    return a / a.std()


def warp(img, amp, beta=2.2, scale=1.0):
    dx = field(beta) * amp * scale
    dy = field(beta) * amp * scale
    return ndi.map_coordinates(img, [(Y + dy) % N, (X + dx) % N], order=1, mode="wrap")


def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


H = np.zeros((N, N), np.float32)          # рельеф (+ выступает, - вдавлено)
T = np.full((N, N), 0.56, np.float32)     # яркость
R = np.ones((N, N), np.float32)           # множители цвета
G = np.ones((N, N), np.float32)
B = np.ones((N, N), np.float32)

# --- зерно основы -----------------------------------------------------------
grain = field(0.6) * 0.030 + field(1.3) * 0.02 + field(0.1) * 0.015
T += grain
H += field(0.9) * 0.05

# --- опалубка: швы между щитами, тон щитов -------------------------------------
PH, PW = 256, 512
rows = N // PH
cols = N // PW
row_off = rng.choice([0, 128, 256, 384], size=rows)
pi = (Y // PH).astype(int)
px = ((X + row_off[pi]) % N)
pj = (px // PW).astype(int)
panel_tone = rng.normal(0, 0.028, size=(rows, cols + 1))
T += panel_tone[pi, pj]
# лёгкий градиент грязи вниз каждого щита
T -= 0.03 * ((Y % PH) / PH) ** 2


def wobble(length, amp, beta=2.0):
    f = np.fft.rfftfreq(length)
    f[0] = 1
    amp_ = f ** (-beta / 2)
    amp_[0] = 0
    s = (rng.normal(size=f.shape) + 1j * rng.normal(size=f.shape)) * amp_
    w = np.fft.irfft(s, n=length)
    return (w / w.std() * amp).astype(np.float32)


seam = np.zeros((N, N), np.float32)
for k in range(rows):
    y0 = k * PH
    w = wobble(N, 2.2)[None, :]
    d = np.abs(Y - (y0 + w))
    d = np.minimum(d, N - d)
    vis = 0.35 + 0.65 * smooth(field(1.2)[0:1, :], -0.8, 0.6)
    seam = np.maximum(seam, np.exp(-(d / 1.4) ** 2) * vis)
    lip = np.exp(-(((Y - (y0 + w)) - 4) / 3) ** 2) * 0.5
    T += lip * 0.05
for k in range(rows):
    for c in range(cols):
        x0 = c * PW - row_off[k]
        ys = slice(k * PH, (k + 1) * PH)
        w = wobble(PH, 1.8)[:, None]
        xx = X[ys]
        d = np.abs(((xx - (x0 + w) + N / 2) % N) - N / 2)
        vis = 0.3 + 0.7 * smooth(field(1.2)[ys, 0:1], -0.8, 0.6)
        seam[ys] = np.maximum(seam[ys], np.exp(-(d / 1.4) ** 2) * vis)
T -= 0.22 * seam
H -= 0.9 * seam

# --- отверстия от стяжек -----------------------------------------------------
for k in range(rows):
    for c in range(cols * 2):
        for hy in (64, 192):
            if rng.random() < 0.55:
                cx = (c * 256 + 128 + (row_off[k] % 256)) % N
                cy = k * PH + hy
                r = 7.5
                x0, x1 = int(cx - r - 4), int(cx + r + 5)
                y0, y1 = int(cy - r - 4), int(cy + r + 5)
                xs = np.arange(x0, x1) % N
                ys_ = np.arange(y0, y1) % N
                gx, gy = np.meshgrid(np.arange(x0, x1) - cx, np.arange(y0, y1) - cy)
                d = np.sqrt(gx ** 2 + gy ** 2)
                inside = smooth(r - d, -0.5, 1.0)
                rim = np.exp(-((d - r - 1.2) / 1.6) ** 2)
                sub = np.ix_(ys_, xs)
                T[sub] -= 0.30 * inside
                T[sub] += 0.05 * rim
                H[sub] -= 1.0 * inside
                H[sub] += 0.25 * rim
                # ржавый потёк ниже отверстия
                if rng.random() < 0.55:
                    L = int(rng.uniform(40, 220))
                    for yy in range(L):
                        a = 0.25 * np.exp(-yy / (L * 0.45))
                        wdt = 2.5 + 1.2 * np.sin(yy / 17.0)
                        xs2 = (np.arange(int(cx - 8), int(cx + 9))) % N
                        prof = np.exp(-(((xs2 - cx) + 0.0) / wdt) ** 2)
                        yidx = int(cy + r + yy) % N
                        T[yidx, xs2] -= 0.05 * a * prof
                        R[yidx, xs2] *= 1 + 0.08 * a * prof
                        B[yidx, xs2] *= 1 - 0.30 * a * prof
                        G[yidx, xs2] *= 1 - 0.14 * a * prof

# --- поры и «соты» (воздушные пузыри) -------------------------------------------
pores = np.zeros((N, N), np.float32)


def stamp(cx, cy, r, depth, rough):
    R_ = int(r * 3.2) + 2
    x0, y0 = int(cx) - R_, int(cy) - R_
    gx, gy = np.meshgrid(np.arange(x0, x0 + 2 * R_ + 1) - cx, np.arange(y0, y0 + 2 * R_ + 1) - cy)
    e = rng.uniform(0.6, 1.7)
    th = rng.uniform(0, np.pi)
    ux = gx * np.cos(th) + gy * np.sin(th)
    uy = -gx * np.sin(th) + gy * np.cos(th)
    d = (ux / (r * e)) ** 2 + (uy / (r / e)) ** 2
    ang = np.arctan2(uy, ux)
    jit = 1 + 0.35 * rough * np.sin(3 * ang + rng.uniform(0, 6)) + 0.2 * rough * np.sin(5 * ang + rng.uniform(0, 6))
    v = depth * np.exp(-((d * jit) ** 1.1))
    sub = np.ix_(np.arange(y0, y0 + 2 * R_ + 1) % N, np.arange(x0, x0 + 2 * R_ + 1) % N)
    pores[sub] = np.maximum(pores[sub], v)


for _ in range(2600):
    r = float(np.clip(np.exp(rng.normal(np.log(3.0), 0.55)), 1.3, 14))
    stamp(rng.uniform(0, N), rng.uniform(0, N), r, rng.uniform(0.45, 1.0), rng.uniform(0, 1))

# скопления пор («соты») как на 2-м референсе
for _ in range(8):
    cx, cy = rng.uniform(0, N), rng.uniform(0, N)
    rad = rng.uniform(70, 230)
    for _ in range(int(rng.uniform(120, 420))):
        a = rng.uniform(0, 2 * np.pi)
        d = rad * np.sqrt(rng.random())
        r = float(np.clip(np.exp(rng.normal(np.log(4.0), 0.5)), 1.8, 12))
        stamp(cx + d * np.cos(a), cy + d * np.sin(a), r, rng.uniform(0.6, 1.0), rng.uniform(0.4, 1))

T -= 0.22 * pores
H -= 0.9 * pores

# --- слой штукатурки / облупившиеся места -----------------------------------------
pl = warp(field(1.8), 90, 2.2) + 0.6 * field(1.0)
exposed = smooth(pl, 1.0, 1.25)          # где штукатурка сошла (~12%)
T += 0.06 * (1 - exposed) - 0.10 * exposed
H += 0.15 * (1 - exposed) - 0.10 * exposed
H += field(0.5) * 0.12 * exposed
edge = np.abs(ndi.gaussian_filter(exposed, 1.2) - 0.5)
T -= 0.08 * np.exp(-(edge / 0.12) ** 2) * (exposed > 0.01)

# --- сколы с заполнителем -----------------------------------------------------------
F = np.zeros((N, N), np.float32)
seeds = []
for _ in range(10):
    cx, cy = rng.uniform(0, N), rng.uniform(0, N)
    rx, ry = rng.uniform(90, 290), rng.uniform(80, 320)
    seeds.append((cx, cy, rx, ry))
    dx = np.minimum(np.abs(X - cx), N - np.abs(X - cx))
    dy = np.minimum(np.abs(Y - cy), N - np.abs(Y - cy))
    F += np.exp(-((dx / rx) ** 2 + (dy / ry) ** 2))
F = warp(F, 35, 2.0) + 0.55 * field(1.6) * 0.5 + 0.18 * field(0.8)
spall = F > 0.62
spall = ndi.binary_opening(spall, iterations=2)
lab, nlab = ndi.label(spall)
sizes = ndi.sum(spall, lab, range(1, nlab + 1))
for i, s in enumerate(sizes, start=1):
    if s < 1800:
        spall[lab == i] = False
lab, nlab = ndi.label(spall)

dist_in = ndi.distance_transform_edt(spall).astype(np.float32)
dist_out = ndi.distance_transform_edt(~spall).astype(np.float32)

# заполнитель: ячейки Вороного = камни
pts = np.column_stack([rng.uniform(0, N, 60000), rng.uniform(0, N, 60000)])
tree = cKDTree(pts)
ys_, xs_ = np.nonzero(spall)
q = np.column_stack([xs_, ys_]).astype(np.float32)
dd, idx = tree.query(q, k=1)
stone_val = rng.uniform(0.28, 0.80, size=len(pts)).astype(np.float32)
stone_warm = rng.uniform(0.0, 1.0, size=len(pts)).astype(np.float32)
cell_r = 6.5
mound = np.clip(1 - dd / cell_r, 0, 1) ** 0.6
stone_t = stone_val[idx]
warm = stone_warm[idx]

Tsp = np.zeros((N, N), np.float32)
Hsp = np.zeros((N, N), np.float32)
Rw = np.ones((N, N), np.float32)
Bw = np.ones((N, N), np.float32)
Tsp[ys_, xs_] = 0.18 + 0.42 * stone_t * (0.55 + 0.45 * mound) + (rng.normal(0, 0.03, len(xs_)))
Hsp[ys_, xs_] = mound * 0.55
Rw[ys_, xs_] = 1.0 + 0.16 * warm
Bw[ys_, xs_] = 1.0 - 0.22 * warm

depth = -0.75 - 0.5 * np.clip(dist_in / 14, 0, 1)
sp = spall.astype(np.float32)
T = T * (1 - sp) + Tsp * sp
T -= 0.16 * np.exp(-(dist_in / 3.0) ** 2) * sp          # тёмный край внутри
T += 0.07 * np.exp(-(dist_out / 5.0) ** 2) * (1 - sp)   # светлая кромка снаружи
T -= 0.08 * np.exp(-((dist_out - 14) / 9.0) ** 2) * (1 - sp)  # тень-потёк вокруг
H = H * (1 - sp) + (depth + Hsp) * sp
H += 0.30 * np.exp(-(dist_out / 4.0) ** 2) * (1 - sp)
R *= Rw
B *= Bw

# --- арматура в самых больших сколах --------------------------------------------------
comp_sizes = [(ndi.sum(spall, lab, i), i) for i in range(1, nlab + 1)]
comp_sizes.sort(reverse=True)
rebar_count = 0
for area, i in comp_sizes[:4]:
    comp = lab == i
    ys_c, xs_c = np.nonzero(comp)
    if xs_c.max() - xs_c.min() > N * 0.8 or ys_c.max() - ys_c.min() > N * 0.8:
        continue  # скол пересекает край картинки: пропускаем
    bx0, bx1 = xs_c.min(), xs_c.max()
    by0, by1 = ys_c.min(), ys_c.max()
    if bx1 - bx0 < 110 or by1 - by0 < 120:
        continue
    x = bx0 + rng.uniform(30, 70)
    bars = []
    while x < bx1 - 20:
        bars.append(x)
        x += rng.uniform(70, 140)
    for xb in bars:
        phase = rng.uniform(0, 6.28)
        xc = xb + 3.0 * np.sin((Y - by0) / 90.0 + phase)
        dxb = X - xc
        hw = rng.uniform(6.5, 9.0)
        prof = np.clip(1 - (dxb / hw) ** 2, 0, 1)
        ytop = rng.uniform(by0, by0 + (by1 - by0) * 0.35)
        ybtm = rng.uniform(by1 - (by1 - by0) * 0.35, by1)
        vis = (np.abs(dxb) < hw) & comp & (dist_in > 2.5) & (Y > ytop) & (Y < ybtm)
        if vis.sum() < 100:
            continue
        rebar_count += 1
        ribs = 0.75 + 0.25 * np.sin(Y / 3.0 + phase)
        tone = 0.30 + 0.30 * prof * ribs
        flake = field(0.2) * 0.04
        Tb = tone + flake
        T[vis] = Tb[vis]
        R[vis] = 1.55
        G[vis] = 0.62
        B[vis] = 0.28
        H[vis] = (0.35 + 0.6 * prof)[vis] + depth[vis] * 0.0
        # потёк ржавчины вниз от арматуры
        ys_v, xs_v = np.nonzero(vis)
        ybot = ys_v.max()
        L = int(rng.uniform(170, 560))
        for yy in range(L):
            yidx = (ybot + yy) % N
            a = 0.8 * np.exp(-yy / (L * 0.42))
            wdt = hw + 3 + 2.5 * np.sin(yy / 23.0 + phase) + yy * 0.012
            xs2 = np.arange(int(xb - 30), int(xb + 31)) % N
            cxm = xb + 3.0 * np.sin((ybot - by0) / 90.0 + phase) + 4 * np.sin(yy / 41.0)
            prof2 = np.exp(-(((np.arange(int(xb - 30), int(xb + 31)) - cxm) / wdt) ** 2))
            n = 0.7 + 0.3 * np.sin(np.arange(61) * 0.9 + yy * 0.05)
            m = a * prof2 * n
            T[yidx, xs2] -= 0.10 * m
            R[yidx, xs2] *= 1 + 0.36 * m
            G[yidx, xs2] *= 1 - 0.36 * m
            B[yidx, xs2] *= 1 - 0.75 * m
    # поперечная проволока
    for _ in range(rng.integers(0, 2)):
        yw = rng.uniform(by0 + 30, by1 - 30)
        wire = (np.abs(Y - yw - 2 * np.sin(X / 70.0)) < 2.2) & comp & (dist_in > 2.5)
        T[wire] = 0.2
        R[wire], G[wire], B[wire] = 1.5, 0.65, 0.3
        H[wire] = 0.7

# --- трещины ----------------------------------------------------------------------------
crack = np.zeros((N, N), np.float32)


def walk(x, y, ang, length, width, branch_p):
    for s in range(int(length)):
        ang += rng.normal(0, 0.12)
        x += np.cos(ang)
        y += np.sin(ang)
        w = width * (0.6 + 0.4 * np.sin(s / 29.0 + width))
        r = max(0.6, w)
        xi, yi = int(x) % N, int(y) % N
        x0, x1, y0, y1 = xi - 3, xi + 4, yi - 3, yi + 4
        gx, gy = np.meshgrid(np.arange(x0, x1) - x, np.arange(y0, y1) - y)
        v = np.exp(-((gx ** 2 + gy ** 2) / (r * r)))
        sub = np.ix_(np.arange(y0, y1) % N, np.arange(x0, x1) % N)
        crack[sub] = np.maximum(crack[sub], v)
        if branch_p and rng.random() < branch_p and length - s > 60:
            walk(x, y, ang + rng.choice([-1, 1]) * rng.uniform(0.5, 1.2), (length - s) * rng.uniform(0.2, 0.5), width * 0.6, 0)


for _ in range(12):
    walk(rng.uniform(0, N), rng.uniform(0, N), rng.uniform(0, 6.28), rng.uniform(400, 1200), rng.uniform(1.4, 2.8), 0.006)
# трещины, идущие от краёв сколов
ys_e, xs_e = np.nonzero((dist_in > 0) & (dist_in < 2))
for _ in range(10):
    j = rng.integers(0, len(xs_e))
    walk(xs_e[j], ys_e[j], rng.uniform(0, 6.28), rng.uniform(120, 420), rng.uniform(0.8, 1.5), 0.01)

crack *= (1 - sp)
T -= 0.42 * crack
H -= 1.0 * crack

# --- потёки: вертикальные, из швов и сколов ----------------------------------------------
streak_src = np.zeros((N, N), np.float32)
for _ in range(90):
    x0 = rng.uniform(0, N)
    y0 = rng.uniform(0, N)
    L = int(rng.uniform(250, 1100))
    wdt = rng.uniform(4, 26)
    inten = rng.uniform(0.05, 0.16)
    xs_all = np.arange(int(x0 - 3 * wdt), int(x0 + 3 * wdt) + 1)
    for yy in range(L):
        a = inten * np.exp(-yy / (L * 0.5)) * (1 - np.exp(-yy / 12))
        wob = 3.5 * np.sin(yy / 53.0 + x0) + 2 * np.sin(yy / 17.0 + y0)
        prof = np.exp(-(((xs_all - (x0 + wob)) / wdt) ** 2))
        stripes = 0.65 + 0.35 * np.sin(xs_all * 0.37 + yy * 0.02 + x0)
        T[(int(y0) + yy) % N, xs_all % N] -= a * prof * stripes
# потёки по вертикальным швам
for k in range(rows):
    for c in range(cols):
        if rng.random() < 0.6:
            xs0 = (c * PW - row_off[k]) % N
            y0 = k * PH
            L = int(rng.uniform(PH * 0.4, PH * 1.8))
            for yy in range(L):
                a = 0.10 * np.exp(-yy / (L * 0.6))
                xs_all = np.arange(xs0 - 10, xs0 + 11) % N
                prof = np.exp(-(((np.arange(-10, 11)) / (3 + yy * 0.01)) ** 2))
                T[(y0 + yy) % N, xs_all] -= a * prof

# --- общее старение: большие тёмные и светлые пятна без «облаков» --------------------------------
age = warp(field(2.0), 60, 2.0)
T += 0.020 * np.clip(age, -1.5, 1.5)

# --- сборка --------------------------------------------------------------------------------------------
T = np.clip(T, 0.04, 0.95)
Rf = np.clip(T * R, 0, 1.0)
Gf = np.clip(T * G, 0, 1.0)
Bf = np.clip(T * B, 0, 1.0)
alb = np.stack([Rf, Gf, Bf], axis=-1)
# в шейдере значение умножается на 2: среднее ≈ 1 = исходный цвет материала
alb = alb / (np.mean(alb) / 0.50)
alb = np.clip(alb, 0, 1)
print("albedo mean", alb.mean())
Image.fromarray((alb * 255).astype(np.uint8)).save("assets/textures/wall_atlas.jpg", quality=90, optimize=True)

Hs = ndi.gaussian_filter(H, 0.8)
gy, gx = np.gradient(Hs)
s = 4.2
nx = -gx * s
ny = gy * s            # ось v направлена вверх (строки идут вниз)
nz = np.ones_like(nx)
ln = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
nx, ny = nx / ln, ny / ln
nrm = np.stack([nx * 0.5 + 0.5, ny * 0.5 + 0.5, nz / ln * 0.5 + 0.5], axis=-1)
Image.fromarray((np.clip(nrm, 0, 1) * 255).astype(np.uint8)).save("assets/textures/wall_atlas_n.jpg", quality=90, optimize=True)
print("rebars", rebar_count, "spalls", nlab)
