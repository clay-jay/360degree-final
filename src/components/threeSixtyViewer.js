import React, { createRef, useEffect, useRef, useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import UseEventListener from "./eventListener"

export default function ThreeSixtyViewer() {
  //запрос для получения base64 изображений (width is fixed = 640px)
  const graphqlQuery = graphql`
    query {
      allFile(
        filter: {
          extension: { regex: "/(jpg)|(jpeg)|(png)/" }
          relativeDirectory: { eq: "360images" }
        }
      ) {
        edges {
          node {
            childImageSharp {
              fixed(base64Width: 640) {
                base64
              }
            }
            base
          }
        }
      }
    }
  `

  //выполняем запрос
  const data = useStaticQuery(graphqlQuery)
  //мапим в массив и сортируем его
  const cleanData = data.allFile.edges
    .map(({ node }) => ({
      id: node.base.replace(".jpg", ""),
      base64: node.childImageSharp.fixed.base64,
    }))
    .sort((a, b) => a.id - b.id)
  //объявляем переменные
  const canvasRef = useRef()
  const [loadedImages, setLoadedImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [startX, setStartX] = useState(0)
  const [endX, setEndX] = useState(null)
  const [currentImage, setCurrentImage] = useState(0)   
  const animation = useRef()
  const [newFrame, setNewFrame] = useState(0)

  useEffect(() => {
        loadImages()
        console.log('useEffect')
  }, [])
  
  //?
  const loadImages = () => {
    const images = cleanData
    if (loadedImages.length === images.length) {
      drawImage(0)
      return
    }
    images.forEach(image => {
      const img = new Image()
      img.src = image.base64
      loadedImages.push(img)
      console.log(loadedImages)
    })
    console.log("loaded")
    drawImage(0)
  }

  const drawImage = frame => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)
    const newImage = loadedImages[frame]
    context.drawImage(newImage, 0, 0)
    setCurrentImage(frame)
  }

  function handleMouseDown(e) {  
    setStartX(e.pageX)
    console.log(startX)
  }

  const handleMouseMove = e => {
    if (startX !== null) {
      const delta = e.pageX - (!endX ? startX : endX)
      setEndX(e.pageX)
      console.log('move: ' + endX)  

      let startingFrame = currentImage
      if (currentImage === loadedImages.length - 1) {
        startingFrame = 0
      } else if (currentImage === 0) {
        startingFrame = loadedImages.length - 1
      }

      let moveFrame = startingFrame
      if (delta > 0) {
        moveFrame = startingFrame - 1
      } else if(delta < 0){
          moveFrame = startingFrame + 1
      }

      setNewFrame(Math.min(Math.max(moveFrame, 0), loadedImages.length - 1))

      if (animation === null) {
        animation.current = requestAnimationFrame(animationFrame)
      }
    }
  }
  const animationFrame = () => {
    drawImage(newFrame)
    animation.current = requestAnimationFrame(animationFrame)
  }

  const handleMouseUp = () => {
    setStartX(null)
    setEndX(null)
    animation && cancelAnimationFrame(animation)
    cancelAnimationFrame(animation.current)
  }

  return (
    <div className="canvasContainer">
      <canvas width="640" height="333" ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}></canvas>
    </div>
  )
}
