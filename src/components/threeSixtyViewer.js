import React, { createRef, useEffect, useRef, useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
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
  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      '& > * + *': {
        marginLeft: theme.spacing(2),
      },
    },
  }));
  const classes = useStyles()

  //объявляем переменные
  const [loadedImages, setLoadedImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [mousePressed, setMousePressed] = useState(false)
  const [startX, setStartX] = useState(0)
  const [endX, setEndX] = useState(null)
  const [currentImage, setCurrentImage] = useState(0)   
  const [currentImageSrc, setCurrentImageSrc] = useState('')
  const [newFrame, setNewFrame] = useState(0)
  
  //выполняем запрос
  const data = useStaticQuery(graphqlQuery)
    //мапим в массив и сортируем его
  const cleanData = data.allFile.edges
  .map(({ node }) => ({
      id: node.base.replace(".jpg", ""),
      base64: node.childImageSharp.fixed.base64,
  }))
  .sort((a, b) => a.id - b.id)

  const loadImages = () => {
    console.log("loaded")
    setCurrentImage(0)
    setCurrentImageSrc(cleanData[currentImage].base64)
    console.log(cleanData)
  }

  const handleMouseDown = (e) => {  
    setStartX(e.pageX)
    setMousePressed(true)
    console.log(startX)
  }

  const handleMouseMove = e => {
    if (mousePressed) {
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
    }
  }

  const handleMouseUp = () => {
    setMousePressed(false)
  }


  if(data.length === cleanData.length){
    return (
    <div className="canvasContainer">
      <img width="640" height="333" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} src={currentImageSrc}></img>
    </div>)
  } else {
    loadImages()
    return (
      <div className={classes.root}>
        <CircularProgress />
      </div>
    )
  }

  
}
