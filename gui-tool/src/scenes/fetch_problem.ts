export async function fetchProblem(problemId: number) {
  const response = await fetch(
    "https://icfpc2021-gon-the-fox-public-msaldk.s3.ap-northeast-1.amazonaws.com/problems/" + problemId + ".json",
    {
      mode: 'cors'
    }
  )
  return await response.json()
}