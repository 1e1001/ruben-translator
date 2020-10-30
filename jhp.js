// PHP but javascript lol
let __ = {
  search: new URLSearchParams(location.search)
}
function $_GET(name) {
  return __.search.get(name)
}
function echo(...args) {
  document.write(args.join(""))
}
function echo(...args) {
  document.write(args.join(""))
}
