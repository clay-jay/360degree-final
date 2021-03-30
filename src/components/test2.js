import React, { useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import { makeStyles } from "@material-ui/core/styles"
import CircularProgress from "@material-ui/core/CircularProgress"
import './test.css'

export default function TestV2() {
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
  const [currentImageSrc, setCurrentImageSrc] = useState("")
  const [loadedImages, setLoadedImages] = useState([])
  const [currentImage, setCurrentImage] = useState(0)
  //изображения загружены
  const [done, setDone] = useState(false)
  const [startX, setStartX] = useState(0)
  const [draggin, setDragging] = useState(false)

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
    })

    if (cleanData.length === loadedImages.length) {
      setDone(true)
      setCurrentImageSrc(loadedImages[0].base64)
      setCurrentImage(0)
      console.log("done")
    }
    console.log(loadedImages)
  }

  const useStyles = makeStyles(theme => ({
    root: {
      display: "flex",
      "& > * + *": {
        marginLeft: theme.spacing(2),
      },
    },
  }))
  const classes = useStyles()

  const handleMouseDown = e => {
    console.log("MouseDown: " + e.pageX)
    setStartX(e.pageX)
    setDragging(true)
  }
  const handleMouseMove = e => {
    if (draggin) {
      const delta = e.pageX - startX
      const absDelta = Math.abs(delta)
      let tempCurrImage = currentImage
      console.log("startPos: " + startX)

      if (absDelta > 3) {
        if (delta > 0) {
          tempCurrImage = tempCurrImage + 1
        } else if (delta < 0) {
          tempCurrImage = tempCurrImage - 1
        }

        if (tempCurrImage > loadedImages.length - 1) {
          tempCurrImage = 0
        } else if (tempCurrImage < 0) {
          tempCurrImage = loadedImages.length - 1
        }

        setCurrentImage(tempCurrImage)
        setCurrentImageSrc(loadedImages[currentImage].base64)
        setStartX(e.pageX)
        console.log("pos changed" + startX)
      }
      console.log("MouseMove: " + e.pageX)
    }
  }
  const handleMouseUp = e => {
    console.log("MouseUp: " + e.pageX)
    setDragging(false)
  }

  if (done) {
    return (
      <div className="App">
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          draggable="false"
        >
            <img
          src={currentImageSrc}
          className='noDragClass'
          draggable='false'

        />
        </div>
      </div>
    )
  } else {
    loadImages()
    return (
      <div className={classes.root}>
        <CircularProgress />
      </div>
    )
  }
}
