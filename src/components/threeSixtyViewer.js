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
  const canvasRef = useRef  ()
  const [loadedImages, setLoadedImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [startX, setStartX] = useState(0)
  const [endX, setEndX] = useState(null)
  const [currentImage, setCurrentImage] = useState(0)   
  const [animation, setAnimation] = useState(null)
  const [newFrame, setNewFrame] = useState(0)

  useEffect(() => {
    const canvas = canvasRef
    loadImages()
    //объявляем хендлеров
    // window.addEventListener("mousedown", handleMouseDown)
    // window.addEventListener("touchstart", handleTouchStart)
    // window.addEventListener("mousemove", handleMouseMove)
    // window.addEventListener("touchmove", handleTouchMove)
    // window.addEventListener("mouseup", handleMouseUp)
    // window.addEventListener("touchend", handleMouseUp)

    // return (
    //   () => window.removeEventListener("mousedown", handleMouseDown),
    //   window.removeEventListener("touchstart", handleTouchStart),
    //   window.removeEventListener("mousemove", handleMouseMove),
    //   window.removeEventListener("touchmove", handleTouchMove),
    //   window.removeEventListener("mouseup", handleMouseUp),
    //   window.removeEventListener("touchend", handleMouseUp)
    // )
  }, [])
  //не справился с управлением Promice

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
  //отрисовка прогрессбара в канвасе
  const drawLoadingBar = progress => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    const barWidth = Math.round(window.innerWidth / 5)
    const barHeight = Math.round(barWidth / 10)
    const barPosX = (canvas.width - barWidth) / 2
    const barPosY = (canvas.height - barHeight) / 2

    context.fillStyle = "#0096d6"
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillRect(barPosX, barPosY, barWidth, barHeight)

    const fillVal = Math.min(Math.max(progress / 100, 0), 1)
    context.fillRect(
      barPosX + 1,
      barPosY + 1,
      fillVal * (barWidth - 2),
      barHeight - 2
    )
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

  const handleTouchStart = e => {
    setStartX(e.touches[0].pageX)
  }

  const handleMouseMove = e => {
    if (startX !== null) {
      const delta = e.pageX - (!endX ? startX : endX)
      setStartX(e.pageX)
      console.log('move: ' + startX)

      let startingFrame = currentImage
      if (currentImage === loadedImages.length - 1) {
        startingFrame = 0
      } else if (currentImage === 0) {
        startingFrame = loadedImages.length - 1
      }

      let moveFrame = startingFrame
      if (delta > 0) {
        moveFrame = startingFrame + 1
      }

      setNewFrame(Math.min(Math.max(moveFrame, 0), loadedImages.length - 1))

    //   if (animation === null) {
    //     setAnimation(requestAnimationFrame(animationFrame))
    //   }
    }
  }
//   const animationFrame = () => {
//     drawImage(newFrame)
//     setAnimation(requestAnimationFrame(animationFrame))
//   }

  const handleTouchMove = e => handleMouseMove(e.touches[0])

  const handleMouseUp = () => {
    setStartX(null)
    setEndX(null)
    //animation && cancelAnimationFrame(animation)
    setAnimation(null)
  }

  return (
    <div className="canvasContainer">
      <canvas width="640" height="333" ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onMouseUp={handleMouseUp}></canvas>
    </div>
  )
}
