import { graphql, useStaticQuery } from "gatsby"
import React, { useState } from "react"
import * as zip from "@zip.js/zip.js"

export default function ZipHandler() {
  const query = graphql`
    {
      file(name: { eq: "bse" }) {
        publicURL
      }
    }
  `
  const data = useStaticQuery(query)
  const [srcArr, setSrcArr] = useState([])
  console.log(data)
  const archive = new zip.ZipReader(new zip.HttpReader(data.file.publicURL))

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
      })
  
  return (
    <div>
      {srcArr.map(src => (
        <img
          src={src}
          alt=""
          style={{ width: "500px", height: "300px" }}
        />
      ))}
      {/* <img src={srcArr[0].base64}/> */}
    </div>
  )
}