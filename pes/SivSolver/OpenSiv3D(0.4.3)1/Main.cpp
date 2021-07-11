
# include <Siv3D.hpp> // OpenSiv3D v0.4.3
#include <filesystem>

#include "GuiSolver.h"

void Main()
{
	// 背景を水色にする
	Scene::SetBackground(ColorF(0.8, 0.9, 1.0));
	FilePath a = FileSystem::ModulePath();
	for(int i=0;i<10;i++){
		if (FileSystem::BaseName(a) == U"pes") break;
		a = FileSystem::ParentPath(a);
	}
	if (FileSystem::BaseName(a) != U"pes") throw Error(U"failed to get base path");
	a = FileSystem::ParentPath(a);

	GuiSolver solver;
	Window::Resize(Size(1080, 800));

	TextEditState problem_id;
	String last_problem_id = U"";
	double hint_dist = 1;

	while (System::Update())
	{
		solver.update();
		// ボタンが押されたら
		SimpleGUI::TextBox(problem_id, Vec2(800, 20), 100, 4);
		if (SimpleGUI::Button(U"Read", Vec2(920, 20)))
		{
			auto file = a;
			file.append(U"problems/");
			file.append(problem_id.text);
			file.append(U".json");
			Print << file;
			if (solver.read(file)) {
				last_problem_id = problem_id.text;
			}
			else {
				problem_id.text = last_problem_id;
			}
		}
		if (SimpleGUI::Button(U"Read Solution", Vec2(800, 100)))
		{
			if (auto file = Dialog::OpenFile({ FileFilter::JSON() })) {
				solver.readSolution(*file);
			}
		}
		if (SimpleGUI::Button(U"Write Solution", Vec2(800, 180)))
		{
			if (auto file = Dialog::SaveFile({ FileFilter::JSON() })) {
				solver.write(*file);
			}
		}
		if (SimpleGUI::Button(U"Read", Vec2(920, 20)))
		{
			auto file = a;
			file.append(U"problems/");
			file.append(problem_id.text);
			file.append(U".json");
			if (solver.read(file)) {
				last_problem_id = problem_id.text;
				ClearPrint();
			}
			else {
				problem_id.text = last_problem_id;
			}
		}
		auto inner = a;
		inner.append(U"hori1991/innerpoint/");
		inner.append(problem_id.text);
		inner.append(U"_innerpoint.txt");
		if (SimpleGUI::Button(U"Write Hint", Vec2(800, 500), unspecified, FileSystem::Exists(inner))) {
			if (auto file = Dialog::SaveFile({ FileFilter::Text() })) {
				solver.writeHint(*file, inner, (int32)hint_dist);
			}
		}
		SimpleGUI::Slider(U"Dist: {:d}"_fmt((int32)hint_dist), hint_dist, 1, 5, Vec2(800, 580), 80, 150);
	}
}

//
// = アドバイス =
// Debug ビルドではプログラムの最適化がオフになります。
// 実行速度が遅いと感じた場合は Release ビルドを試しましょう。
// アプリをリリースするときにも、Release ビルドにするのを忘れないように！
//
// 思ったように動作しない場合は「デバッグの開始」でプログラムを実行すると、
// 出力ウィンドウに詳細なログが表示されるので、エラーの原因を見つけやすくなります。
//
// = お役立ちリンク =
//
// OpenSiv3D リファレンス
// https://siv3d.github.io/ja-jp/
//
// チュートリアル
// https://siv3d.github.io/ja-jp/tutorial/basic/
//
// よくある間違い
// https://siv3d.github.io/ja-jp/articles/mistakes/
//
// サポートについて
// https://siv3d.github.io/ja-jp/support/support/
//
// Siv3D ユーザコミュニティ Slack への参加
// https://siv3d.github.io/ja-jp/community/community/
//
// 新機能の提案やバグの報告
// https://github.com/Siv3D/OpenSiv3D/issues
//
