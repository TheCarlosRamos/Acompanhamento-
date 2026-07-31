import pandas as pd
import json

df = pd.read_excel('Planilha Modelo setembro25.xlsx')
print("Colunas:")
for i, col in enumerate(df.columns):
    print(f"  {i}: {col}")
print(f"\nTotal de colunas: {len(df.columns)}")
print(f"Total de linhas: {len(df)}")
print("\nPrimeiras 2 linhas:")
print(df.head(2).to_string())
