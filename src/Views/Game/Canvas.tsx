import React, { FC, useRef, useEffect } from 'react'
import { Line, Paint } from '../../Models/GameModel'
import P from 'paper'
import { style } from 'typestyle'
import { DocumentReference, addDoc, collection } from '@firebase/firestore'

const drawLine = (line: Line): void => {
  const drawing = new P.Path.Line(
    new P.Point(line.coords[0], line.coords[1]),
    new P.Point(line.coords[2], line.coords[3]),
  )
  drawing.strokeColor = new P.Color(line.color)
  drawing.strokeWidth = line.width
}

const drawItem = (item: Paint): void => {
  switch (item.paintType) {
    case 'line':
      drawLine(item)
  }
}

type Unsaved<T> = Omit<T, 'uid' | 'id'>

const initPaper = (canvas: HTMLCanvasElement, addPaint: (paint: Unsaved<Paint>) => unknown): (() => void) => {
  P.setup(canvas)
  const drawing = new P.Path.Line(new P.Point(100, 100), new P.Point(200, 200))
  drawing.strokeColor = new P.Color('white')
  drawing.strokeWidth = 10
  let downPoint: paper.Point
  const toDelete: paper.Item[] = []
  console.log('init')
  const onWheel = (e: WheelEvent): void => {
    console.log(e.deltaY)
    const delta = e.deltaY > 0 ? 0.15 : -0.15
    P.view.zoom = Math.min(4, Math.max(P.view.zoom + delta, 0.1))
  }
  canvas.addEventListener('wheel', onWheel)

  P.view.onMouseDown = (e: paper.MouseEvent): void => {
    const startIndicator = new P.Shape.Circle(e.point, 2)
    startIndicator.fillColor = new P.Color('white')
    toDelete.push(startIndicator)
    // TODO clean up garbage
    // TODO investigate Quota exceeded
    downPoint = e.point
  }

  P.view.onMouseDrag = (e: paper.MouseEvent): void => {
    toDelete.forEach((d) => d.remove())
    const line = new P.Path.Line(downPoint, e.point)
    toDelete.push(line)
  }
  P.view.onMouseUp = (e: paper.MouseEvent): void => {
    if (downPoint) {
      addPaint({
        kind: 'Paint',
        paintType: 'line',
        coords: [downPoint.x, downPoint.y, e.point.x, e.point.y],
        color: 'white',
        width: 3,
        date: Date.now(),
        note: '',
        username: '',
      })
    }
  }
  return (): void => {
    canvas.removeEventListener('wheel', onWheel)
  }
}

export const Canvas: FC<{ items: Paint[]; gdoc: DocumentReference }> = ({ items, gdoc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const addPaint = (paint: Unsaved<Paint>): void => {
      addDoc(collection(gdoc, 'rolls'), paint).catch((e) => {
        console.error(e)
        alert('failed to send message')
      })
    }
    canvas && initPaper(canvas, addPaint)
  }, [])
  useEffect(() => {
    items.forEach(drawItem)
  }, [items])

  return (
    <>
      <canvas
        ref={canvasRef}
        className={style({ width: '100%', height: '100%' })}
        id="canvas"
        data-paper-resize="true"
      />
    </>
  )
}
