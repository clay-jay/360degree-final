import React, { useEffect, useState } from 'react'
import { useStaticQuery, graphql } from "gatsby"
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import './test.css'
import UseEventListener from './eventListener'

export default function Test() {
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
  const [currentImageSrc, setCurrentImageSrc] = useState('')
  const [loadedImages, setLoadedImages] = useState([])
  const [currentImage, setCurrentImage] = useState(0)
  const [done, setDone] = useState(false)
  const [startX, setStartX] = useState(0)
  const [endX, setEndX] = useState(null)

  const data = useStaticQuery(graphqlQuery)

  const loadImages = () => {
    const cleanData = data.allFile.edges
    .map(({ node }) => ({
        id: node.base.replace(".jpg", ""),
        base64: node.childImageSharp.fixed.base64,
    }))
    .sort((a, b) => a.id - b.id)

    cleanData.forEach(item => {
        loadedImages.push(item)        
    });


    if(cleanData.length === loadedImages.length){
        setDone(true)
        setCurrentImageSrc(loadedImages[0].base64)
        setCurrentImage(0)
        console.log('done')
    }
    console.log(loadedImages)
  }

  const handleDragStart = (e) =>{
      setStartX(e.pageX)
      console.log(startX)
  }

  const handleDragEnd = (e) => {
      console.log('mouseUp' + e.pageX)
  }
  
  const handleDragMove = (e) => {
    //console.log('mouseMoving: ' + e.pageX)
    // const delta = e.pageX - (!endX ? startX : endX)
    // setEndX(e.pageX)
    // console.log('move: ' + endX)  

    // let startingFrame = currentImage
    // if (currentImage === loadedImages.length - 1) {
    //   startingFrame = 0
    // } else if (currentImage === 0) {
    //   startingFrame = loadedImages.length - 1
    // }

    // let moveFrame = startingFrame
    // if (delta > 0) {
    //   moveFrame = startingFrame - 1
    // } else if(delta < 0){
    //     moveFrame = startingFrame + 1
    // }

    // setCurrentImage(moveFrame)
    // setCurrentImageSrc(loadedImages[currentImage].base64)

    const delta = e.pageX - startX
    const absDelta = Math.abs(delta)
    let tempCurrImage = currentImage
    console.log('startPos: '+ startX);

    if (absDelta > 3){
        if (delta > 0){
            tempCurrImage = tempCurrImage + 1
        } else if (delta < 0){
            tempCurrImage = tempCurrImage - 1
        }

        if (tempCurrImage > loadedImages.length - 1) {
            tempCurrImage = 0
        } else if (tempCurrImage < 0){
            tempCurrImage = loadedImages.length - 1
        }

        setCurrentImage(tempCurrImage)
        setCurrentImageSrc(loadedImages[currentImage].base64)
        setStartX(e.pageX)
        console.log('pos changed' + startX);
    }
    

  }

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      '& > * + *': {
        marginLeft: theme.spacing(2),
      },
    },
  }));
  const classes = useStyles()
//   UseEventListener(handleMouseDown, "mousedown")
//   UseEventListener(handleMouseUp, "mousedown")
//   UseEventListener(handleMouseMove, "mousemove")
  if(done){
      return(
          <div>
              <img className="noDragClass" width='640' height ="333" src={currentImageSrc} onDragStart={handleDragStart} onDrag={handleDragMove} onDragEnd ={handleDragEnd}/>
          </div>
      )
  } else {
    loadImages()
      return(
      <div className={classes.root}>
          <CircularProgress />
      </div>
      )

  }
}