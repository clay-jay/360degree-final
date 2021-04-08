import React, { useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import CircularProgress from '@material-ui/core/CircularProgress';
import * as zip from "@zip.js/zip.js"
import './threeSixtyViewer.css'

  export default function ThreeSixtyViewer() {
    const query = graphql`
    {
      file(name: { eq: "bse" }) {
        publicURL
      }
    }
  `
  const data = useStaticQuery(query)
  const [srcArr, setSrcArr] = useState([])
  const archive = new zip.ZipReader(new zip.HttpReader(data.file.publicURL))
  const [doneLoading, setDoneLoading] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [startX, setStartX] = useState(0)
  const [draggin, setDragging] = useState(false)

  const loadImages = () => {
    if (srcArr.length === 0)
    archive
      .getEntries()
      .then(res => {
        const arrayPromis = res
          .filter(
            item =>
              item.filename.includes(".jpg") &&
              !item.filename.includes("MACOSX")
          )
          .sort((a, b) => a.filename.localeCompare(b.filename))
          .map((item) => item.getData(new zip.Data64URIWriter()))

        return Promise.all(arrayPromis)
      })
      .then(res => {
        setSrcArr(res)
        setDoneLoading(true)
      })
  } 

  const handleMouseDown = e => {
    setStartX(e.pageX)
    setDragging(true)
    document.body.style.cursor = 'w-resize';
  }
  const handleMouseMove = e => {
    if (draggin) {
      const delta = e.pageX - startX
      const absDelta = Math.abs(delta)
      let tempCurrImage = currentImage

      if (absDelta > 3) {
        if (delta > 0) {
          tempCurrImage = tempCurrImage + 1
        } else if (delta < 0) {
          tempCurrImage = tempCurrImage - 1
        }

        if (tempCurrImage > srcArr.length - 1) {
          tempCurrImage = 0
        } else if (tempCurrImage < 0) {
          tempCurrImage = srcArr.length - 1
        }

        setCurrentImage(tempCurrImage)
        setStartX(e.pageX)
      }
    }
  }
  const handleMouseUp = e => {
    setDragging(false)
    document.body.style.cursor = 'pointer';
  }
  const handleMouseOver = e => {
    document.body.style.cursor = 'pointer';
  }
  
  if (doneLoading) {
    return (
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseOver={handleMouseOver}
          draggable="false"
          style={{  width: '640px' }}
        >
            <img
          src={srcArr[currentImage]}
          className='noDragClass'
          draggable='false'
        />
        </div>
    )
  } else {
    loadImages()
    return (
      <div className="loadingDiv">
        <CircularProgress className="circle" />
      </div>
    )
  }
  
}
