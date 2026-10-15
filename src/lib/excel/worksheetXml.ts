import type { item } from "../../components/interface";

const NS ='http://schemas.openxmlformats.org/spreadsheetml/2006/main'


export function writeProductRows(
    document:XMLDocument,
    items: readonly item[]
):void{
    const sheetData = document.getElementsByTagNameNS(NS, 'sheetData')[0]

    if(!sheetData){
        throw new Error('データが見つかりません')
    }

    for (const row of Array.from(sheetData.children)){
        if(Number(row.getAttribute('r'))<2)continue;

        for(const cell of Array.from(row.children)){
            const adsress = cell.getAttribute('r')??""
            
            if(/^[ABC]\d+$/.test(adsress)){
                cell.replaceChildren()
                cell.removeAttribute('t')
            }
        }
    }

    items.forEach((product,producrtIndex) =>{
        const rowNumber = producrtIndex + 2;

        let row = Array.from(sheetData.children).find((element)=>
            Number(element.getAttribute('r')) === rowNumber
        )

        if(!row){
            row = document.createElementNS(NS,'row')
            row.setAttribute('r',String(rowNumber))

            const nextRow = Array.from(sheetData.children).find((element)=>
                Number(element.getAttribute('r')) > rowNumber
            )

            sheetData.insertBefore(row, nextRow ?? null)
        }

        const values = [product.name,product.price,0]

        values.forEach((value,columnIndex)=>{
            const column = ['A','B','C'][columnIndex]
            const address = `${column}${rowNumber}`

            let cell = Array.from(row.children).find((element)=>
                element.getAttribute('r') === address
            )
            
            if(!cell){
                cell = document.createElementNS(NS,'c')
                cell.setAttribute('r',address)

                const nextCell = Array.from(row.children).find((element)=>{
                    const letters = (element.getAttribute('r')??"").replace(/\d+$/,'')

                    return letters.length > 1 || letters > column

                })

                row.insertBefore(cell,nextCell??null)
            }

            cell.replaceChildren()

            if(typeof value === "string"){
                cell.setAttribute('t','inlineStr')
            
                const inlineString = document.createElementNS(NS,'is')
                const text = document.createElementNS(NS,'t')
                text.setAttributeNS(
                    'http://www.w3.org/XML/1998/namespace',
                    'xml:space',
                    'preserve',
                )
                text.textContent = value

                inlineString.appendChild(text)
                cell.appendChild(inlineString)
            }else{
                cell.removeAttribute('t')

                const number = document.createElementNS(NS,'v')
                number.textContent = String(value)
                cell.appendChild(number)
            }
        })
    })

}