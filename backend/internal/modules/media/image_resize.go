package media

import (
	"image"
	"image/color"
	"math"
)

// fitImage downsizes proportionally without inventing dimensions or upscaling.
func fitImage(source image.Image, maxW, maxH int) image.Image {
	b := source.Bounds()
	scale := math.Min(1, math.Min(float64(maxW)/float64(b.Dx()), float64(maxH)/float64(b.Dy())))
	if scale >= 1 {
		return source
	}
	w, h := int(math.Max(1, math.Round(float64(b.Dx())*scale))), int(math.Max(1, math.Round(float64(b.Dy())*scale)))
	out := image.NewNRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			sx, sy := (float64(x)+0.5)/scale-0.5, (float64(y)+0.5)/scale-0.5
			x0, y0 := int(math.Max(0, math.Floor(sx))), int(math.Max(0, math.Floor(sy)))
			x1, y1 := min(x0+1, b.Dx()-1), min(y0+1, b.Dy()-1)
			fx, fy := math.Max(0, sx-float64(x0)), math.Max(0, sy-float64(y0))
			a := color.NRGBAModel.Convert(source.At(b.Min.X+x0, b.Min.Y+y0)).(color.NRGBA)
			c := color.NRGBAModel.Convert(source.At(b.Min.X+x1, b.Min.Y+y0)).(color.NRGBA)
			d := color.NRGBAModel.Convert(source.At(b.Min.X+x0, b.Min.Y+y1)).(color.NRGBA)
			e := color.NRGBAModel.Convert(source.At(b.Min.X+x1, b.Min.Y+y1)).(color.NRGBA)
			blend := func(a, c, d, e uint8) uint8 {
				return uint8(math.Round((float64(a)*(1-fx)+float64(c)*fx)*(1-fy) + (float64(d)*(1-fx)+float64(e)*fx)*fy))
			}
			out.SetNRGBA(x, y, color.NRGBA{R: blend(a.R, c.R, d.R, e.R), G: blend(a.G, c.G, d.G, e.G), B: blend(a.B, c.B, d.B, e.B), A: 255})
		}
	}
	return out
}
