Attribute VB_Name = "Module3"
Option Explicit

Public Sub CreateButtons()
    Dim ws As Worksheet
    Dim i As Long, r As Long, col As Long, lastRow As Long
    Dim shp As Shape, target As Range, accountingButton As Shape
    Dim action As String, macroName As String
    Dim previousScreenUpdating As Boolean
    Dim errorNumber As Long, errorDescription As String

    previousScreenUpdating = Application.ScreenUpdating
    On Error GoTo Failed
    Set ws = ThisWorkbook.Worksheets("会計")
    If ws.ProtectDrawingObjects Then
        Err.Raise vbObjectError + 1000, "CreateButtons", "会計シートの図形保護を解除してください。"
    End If
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    Application.ScreenUpdating = False

    ' Identify the checkout button before removing any quantity controls.
    For Each shp In ws.Shapes
        If shp.Name = "BtnAccounting" Or ButtonMacroName(shp.OnAction) = "ClickAccountingButton" Then
            Set accountingButton = shp
            Exit For
        End If
    Next shp
    If accountingButton Is Nothing Then
        Set accountingButton = ws.Shapes.AddShape(msoShapeRoundedRectangle, 0, 0, 100, 30)
        accountingButton.Fill.ForeColor.RGB = RGB(40, 110, 80)
        accountingButton.Line.Visible = msoFalse
        accountingButton.TextFrame.Characters.Font.Color = RGB(255, 255, 255)
    End If
    With accountingButton
        .Name = "BtnAccounting"
        .TextFrame.Characters.Text = "会計"
        .TextFrame.Characters.Font.Size = 18
        .TextFrame.Characters.Font.Bold = True
        .OnAction = "'" & Replace(ThisWorkbook.Name, "'", "''") & "'!ClickAccountingButton"
    End With
    CenterButton accountingButton, ws.Range("G2:H3"), 3, 3

    ' Remove only quantity buttons, including buttons made by older versions.
    For i = ws.Shapes.Count To 1 Step -1
        Set shp = ws.Shapes(i)
        action = ButtonMacroName(shp.OnAction)
        If shp.Name <> "BtnAccounting" And action <> "ClickAccountingButton" Then
            If shp.Name Like "BtnMinus_*" Or shp.Name Like "BtnPlus_*" _
                Or action = "DecreaseQuantity" Or action = "IncreaseQuantity" Then shp.Delete
        End If
    Next i

    For r = 2 To lastRow
        If Not IsError(ws.Cells(r, 1).Value2) Then
            If Len(Trim$(CStr(ws.Cells(r, 1).Value2))) > 0 Then
                For col = 4 To 5
                    Set target = ws.Cells(r, col)
                    ' Hidden rows/columns cannot contain a usable button.
                    If target.Width > 4 And target.Height > 4 Then
                        Set shp = ws.Shapes.AddShape(msoShapeRoundedRectangle, _
                            target.Left + 2, target.Top + 2, target.Width - 4, target.Height - 4)
                        With shp
                            If col = 4 Then
                                .Name = "BtnMinus_" & r
                                .TextFrame.Characters.Text = "-"
                                .Fill.ForeColor.RGB = RGB(65, 135, 245)
                                .Line.ForeColor.RGB = RGB(40, 100, 200)
                                macroName = "DecreaseQuantity"
                            Else
                                .Name = "BtnPlus_" & r
                                .TextFrame.Characters.Text = "+"
                                .Fill.ForeColor.RGB = RGB(235, 85, 85)
                                .Line.ForeColor.RGB = RGB(190, 50, 50)
                                macroName = "IncreaseQuantity"
                            End If
                            .TextFrame.HorizontalAlignment = xlHAlignCenter
                            .TextFrame.VerticalAlignment = xlVAlignCenter
                            With .TextFrame.Characters.Font
                                .Size = 12
                                .Bold = True
                                .Color = RGB(255, 255, 255)
                            End With
                            .OnAction = "'" & Replace(ThisWorkbook.Name, "'", "''") & "'!" & macroName
                            .Placement = xlMoveAndSize
                        End With
                        CenterButton shp, target, 3, 2
                    End If
                Next col
            End If
        End If
    Next r

    Application.ScreenUpdating = previousScreenUpdating
    Exit Sub
Failed:
    errorNumber = Err.Number
    errorDescription = Err.Description
    Application.ScreenUpdating = previousScreenUpdating
    Err.Raise errorNumber, "CreateButtons", errorDescription
End Sub

Private Function ButtonMacroName(ByVal action As String) As String
    If InStrRev(action, "!") > 0 Then action = Mid$(action, InStrRev(action, "!") + 1)
    If InStrRev(action, ".") > 0 Then action = Mid$(action, InStrRev(action, ".") + 1)
    ButtonMacroName = action
End Function

Private Sub CenterButton(ByVal button As Shape, ByVal target As Range, _
    ByVal horizontalPadding As Double, ByVal verticalPadding As Double)
    Dim buttonWidth As Double, buttonHeight As Double
    buttonWidth = Application.Max(1, target.Width - 2 * horizontalPadding)
    buttonHeight = Application.Max(1, target.Height - 2 * verticalPadding)
    With button
        .LockAspectRatio = msoFalse
        .Width = buttonWidth
        .Height = buttonHeight
        .Left = target.Left + (target.Width - .Width) / 2
        .Top = target.Top + (target.Height - .Height) / 2
        .Placement = xlMoveAndSize
        With .TextFrame
            .AutoSize = False
            .MarginLeft = 0
            .MarginRight = 0
            .MarginTop = 0
            .MarginBottom = 0
            .HorizontalAlignment = xlHAlignCenter
            .VerticalAlignment = xlVAlignCenter
        End With
    End With
End Sub
