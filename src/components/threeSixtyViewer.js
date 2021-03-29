import React, { createRef, useEffect, useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import UseEventListener from './eventListener'

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
  const canvasRef = createRef()
  const loadedImages = []
  const [startX, setStartX] = useState(null)
  const [endX, setEndX] = useState(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [animation, setAnimation] = useState(null)
  const [newFrame, setNewFrame] = useState(0)

  useEffect(() => {
      const canvas = canvasRef.current
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight 
      //const context = canvas.getContext("2d")
      //canvas.width = canvas.clientWidth
      //canvas.height = canvas.clientHeight 
    //   var image = new Image()
    //   image.src = cleanData[0].base64
    //   image.onload = () =>{
    //       console.log('loaded')
    //       context.drawImage(image, 0, 0)
    //   } 

    //загружаем изображения
    loadImages()
    drawImage(5)
    // canvas.addEventListener("mousedown", handleMouseDown, false);
    // canvas.addEventListener("touchstart", handleTouchStart, false);
    // canvas.addEventListener("mousemove", handleMouseMove, false);
    // canvas.addEventListener("touchmove", handleTouchMove, false);
    // canvas.addEventListener("mouseup", handleMouseUp, false);
    // canvas.addEventListener("touchend", handleMouseUp, false);

    return () => {
        //const canvas = canvasRef.current

        // Remove all event listeners before the component gets removed from the page.
        // canvas.removeEventListener("mousedown", handleMouseDown, false);
        // canvas.removeEventListener("touchstart", handleTouchStart, false);
        // canvas.removeEventListener("mousemove", handleMouseMove, false);
        // canvas.removeEventListener("touchmove", handleTouchMove, false);
        // canvas.removeEventListener("mouseup", handleMouseUp, false);
        // canvas.removeEventListener("touchend", handleMouseUp, false);
    }
  })
  
  //не справился с управлением Promice
  const loadImages = () => {
    const images = cleanData
    images.forEach((image) => {
        const img = new Image()
        img.src = image.base64
        loadedImages.push(img)
        if(loadedImages.length === images.length){
            console.log('images loaded')
            return
        } else{
            drawLoadingBar(
                (loadedImages.length * 100)/ images.length
            )
        }
    })
 }
 
 //отрисовка прогрессбара в канвасе
 const drawLoadingBar = (progress) => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    const barWidth = Math.round(window.innerWidth / 5)
    const barHeight = Math.round(barWidth / 10)
    const barPosX = (canvas.width - barWidth) / 2
    const barPosY = (canvas.height - barHeight) / 2
    
    context.fillStyle = "#0096d6"
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillRect(barPosX, barPosY, barWidth, barHeight)

    const fillVal = Math.min(Math.max(progress / 100, 0), 1);
    context.fillRect(
      barPosX + 1,
      barPosY + 1,
      fillVal * (barWidth - 2),
      barHeight - 2
    );
 }

 const drawImage = (frame) => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)
    const newImage = loadedImages[frame]
    context.drawImage(newImage, 0, 0);
    setCurrentImage(frame)
}

const handleMouseDown = (e) => {
    setStartX(e.clientX)
}

const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX)
}

const handleMouseMove = (e) => {
    if (startX !== null) {
        const delta = e.clientX - (!endX ? startX : endX)
        setStartX(e.clientX)

        let startingFrame = currentImage
        if (currentImage === loadedImages.length - 1) {
            startingFrame = 0
        } else if (currentImage === 0) {
            startingFrame = loadedImages.length -1
        }
        
        let moveFrame = startingFrame
        if (delta > 0) {
            moveFrame = startingFrame + 1
        }
        
        setNewFrame(Math.min(
            Math.max(moveFrame, 0),
            loadedImages.length - 1
        )) 

        if (animation === null) {
            setAnimation(requestAnimationFrame(animationFrame))
        }
    }
}
const animationFrame = () => {
    drawImage(newFrame)
    setAnimation(requestAnimationFrame(animationFrame))
}

const handleTouchMove = (e) => handleMouseMove(e.touches[0])

const handleMouseUp = () => {
    setStartX(null)
    setEndX(null)
    animation && cancelAnimationFrame(animation)
    setAnimation(null)
}

  //объявляем хендлеров
  UseEventListener("mousedown", handleMouseDown)
  UseEventListener("touchstart", handleTouchStart)
  UseEventListener("mousemove", handleMouseMove)
  UseEventListener("touchmove", handleTouchMove)
  UseEventListener("mouseup", handleMouseUp)
  UseEventListener("touchend", handleMouseUp)

  return (
    <div className="canvasContainer">
      <canvas width='640' height='333' ref={canvasRef}>

      </canvas>
      <script src='threeSixtyViewer.js'/>
    </div>
  )
}
